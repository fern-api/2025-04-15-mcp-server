interface Command {
  button_id: string;
  command_name: string;
}

interface Payload {
  target_id?: string;
  text?: string;
  new_element_type?: keyof ElementPresets;
  background_color?: string;
}

const commands: Command[] = [
  {
    button_id: "get_all_elements",
    command_name: "get_all_elements",
  },
  {
    button_id: "get_selected_element",
    command_name: "get_selected_element",
  },
  {
    button_id: "set_selected_element",
    command_name: "set_selected_element",
  },
  {
    button_id: "set_text_content",
    command_name: "set_text_content",
  },
  {
    button_id: "insert_element_before",
    command_name: "insert_element_before",
  },
  {
    button_id: "insert_element_after",
    command_name: "insert_element_after",
  },
  {
    button_id: "prepend_element",
    command_name: "prepend_element",
  },
  {
    button_id: "append_element",
    command_name: "append_element",
  },
  {
    button_id: "set_style_background_color",
    command_name: "set_style_background_color",
  },
];

function addButtonListeners() {
  function testPayloads(target_id: string): Record<string, Payload> {
    return {
      get_all_elements: {},
      get_selected_element: {},
      set_selected_element: {
        target_id: target_id,
      },
      set_text_content: {
        target_id: target_id,
        text: "Hello World",
      },
      insert_element_before: {
        target_id: target_id,
        new_element_type: "Button",
      },
      insert_element_after: {
        target_id: target_id,
        new_element_type: "Button",
      },
      prepend_element: {
        target_id: target_id,
        new_element_type: "Button",
      },
      append_element: {
        target_id: target_id,
        new_element_type: "Button",
      },
      set_style_background_color: {
        target_id: target_id,
        background_color: "red",
      },
    };
  }

  commands.forEach((command) => {
    const button = document.getElementById(command.button_id);
    button.addEventListener("click", async () => {
      try {
        const selectedElement = await getSelectedElement();
        await handleCommand(
          command.command_name,
          testPayloads(selectedElement.id.element)[command.command_name]
        );
      } catch (error) {
        console.error(error);
      }
    });
  });
}

addButtonListeners();

function validatePayload(command_name: string, payload: Payload) {
  switch (command_name) {
    case "get_all_elements":
    case "get_selected_element": {
      break;
    }
    case "set_selected_element": {
      if (!payload.target_id) {
        throw new Error("target_id is required");
      }
      break;
    }
    case "set_text_content": {
      if (!payload.target_id || !payload.text) {
        throw new Error("target_id and text are required");
      }
      break;
    }
    case "insert_element_before":
    case "insert_element_after":
    case "prepend_element":
    case "append_element": {
      if (!payload.target_id || !payload.new_element_type) {
        throw new Error("target_id and new_element_type are required");
      }
      break;
    }
    case "set_style_background_color": {
      if (!payload.target_id || !payload.background_color) {
        throw new Error("target_id and background_color are required");
      }
      break;
    }
    default: {
      throw new Error(`command_name is not valid: ${command_name}`);
    }
  }
}

async function handleCommand(
  command_name: string,
  payload: Payload
): Promise<AnyElement | AnyElement[]> {
  validatePayload(command_name, payload);
  switch (command_name) {
    case "get_all_elements": {
      return getAllElements();
    }
    case "get_selected_element": {
      return getSelectedElement();
    }
    case "set_selected_element": {
      return setSelectedElement(payload.target_id);
    }
    case "set_text_content": {
      const element = await _getElementById(payload.target_id);
      return setTextOrContent(element, payload.text);
    }
    case "insert_element_before": {
      const element = await _getElementById(payload.target_id);
      const new_element = webflow.elementPresets[payload.new_element_type];
      return insertElementBefore(element, new_element);
    }
    case "insert_element_after": {
      const element = await _getElementById(payload.target_id);
      const new_element = webflow.elementPresets[payload.new_element_type];
      return insertElementAfter(element, new_element);
    }
    case "prepend_element": {
      const element = await _getElementById(payload.target_id);
      const new_element = webflow.elementPresets[payload.new_element_type];
      return prependElement(element, new_element);
    }
    case "append_element": {
      const element = await _getElementById(payload.target_id);
      const new_element = webflow.elementPresets[payload.new_element_type];
      return appendElement(element, new_element);
    }
    case "set_style_background_color": {
      const element = await _getElementById(payload.target_id);
      return setStyleBackgroundColor(element, payload.background_color);
    }
    default: {
      throw new Error(`command_name is not valid: ${command_name}`);
    }
  }
}

async function getAllElements() {
  const elements = await webflow.getAllElements();
  console.log("getAllElements", { elements });
  return elements;
}

async function getSelectedElement() {
  const element = await webflow.getSelectedElement();
  console.log("getSelectedElement", { element });
  return element;
}

async function _getElementById(target_id: string) {
  const elements = await getAllElements();
  const element = elements.find((el) => el.id.element === target_id);
  console.log("_getElementById", { element });
  return element;
}

async function setSelectedElement(target_id: string) {
  const _element = await _getElementById(target_id);
  const element = await webflow.setSelectedElement(_element);
  console.log("setSelectedElement", { element });
  return element;
}

async function setTextOrContent(
  element: AnyElement,
  text: string
): Promise<AnyElement> {
  if (element && element.children) {
    const children = await element.getChildren();
    const textChildren = children.filter(
      (child) => child && (child.type === "String" || child.textContent)
    );
    if (textChildren.length > 0) {
      // Set text on first child by default
      return setTextOrContent(textChildren[0], text);
    }
  } else if (element && element.type === "String") {
    console.log("setText", { element });
    return element.setText(text);
  } else if (element && element.textContent) {
    console.log("setTextContent", { element });
    return element.setTextContent(text);
  } else {
    throw new Error(
      `target_id does not support setTextOrContent: ${element.id.element}`
    );
  }
}

async function insertElementBefore(
  element: AnyElement,
  newElement: ElementPresets[keyof ElementPresets]
) {
  console.log("insertElementBefore", { element, newElement });
  return element.before(newElement);
}

async function insertElementAfter(
  element: AnyElement,
  newElement: ElementPresets[keyof ElementPresets]
) {
  console.log("insertElementAfter", { element, newElement });
  return element.after(newElement);
}

async function prependElement(
  element: AnyElement,
  newElement: ElementPresets[keyof ElementPresets]
) {
  console.log("prependElement", { element, newElement });
  if (element && element.children) {
    return element.prepend(newElement);
  } else {
    throw new Error(
      `target_id does not support prependElement: ${element.id.element}`
    );
  }
}

async function appendElement(
  element: AnyElement,
  newElement: ElementPresets[keyof ElementPresets]
) {
  console.log("appendElement", { element, newElement });
  if (element && element.children) {
    return element.append(newElement);
  } else {
    throw new Error(
      `target_id does not support appendElement: ${element.id.element}`
    );
  }
}

async function setStyleBackgroundColor(
  element: AnyElement,
  background_color: string
) {
  console.log("setStyleBackgroundColor", { element, background_color });
  const newStyle = await webflow.createStyle(
    `[name] background-color: ${background_color}`
  );
  (await newStyle).setProperties({ "background-color": background_color });
  if (element?.styles) {
    // Apply style to selected element
    return await element.setStyles([newStyle]);
  } else {
    throw new Error(
      `target_id does not support setStyleBackgroundColor: ${element.id.element}`
    );
  }
}

//
//
//

let socket: WebSocket | null = null;

function connectWebSocket() {
  // Clear any existing connection
  if (socket) {
    console.log("Closing existing WebSocket connection");
    socket.close();
  }

  try {
    console.log("Connecting to WebSocket server on port 3055...");
    socket = new WebSocket("ws://localhost:3055");

    socket.onopen = () => {
      console.log("✅ Connected to WebSocket server");
    };

    socket.onclose = (event) => {
      console.log(
        `❌ Disconnected from WebSocket server: ${event.code} ${event.reason}`
      );
    };

    socket.onerror = (error) => {
      console.error("❌ WebSocket error:", error);
    };

    socket.onmessage = async (event) => {
      console.log("onmessage");

      try {
        const data = JSON.parse(event.data);
        console.log("Received message:", {
          data,
          command_name: data.command_name,
        });

        if (data.clientType === "extension") {
          console.log(`Skipping MCP message clientType: ${data.clientType}`);
          return;
        }

        if (data.command_name) {
          try {
            const element = await handleCommand(data.command_name, data.params);
            sendMessage({
              id: data.id,
              command_name: data.command_name,
              clientType: "extension",
              result: element,
              success: true,
            });
          } catch (error) {
            console.error("Error executing command:", error);
            sendMessage({
              id: data.id,
              command_name: data.command_name,
              clientType: "extension",
              success: false,
            });
          }
        } else {
          console.log("Received message:", data);
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };
  } catch (error) {
    console.error("Error creating WebSocket connection:", error);
  }
}

function sendMessage(message: any) {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(message));
  } else {
    console.error("WebSocket is not connected");
  }
}

connectWebSocket();
