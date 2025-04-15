import z from "zod";

export const commands = [
  {
    commandName: "get_all_elements" as const,
    description: "Get all elements on the page",
    apiType: "socket" as const,
    paramsSchema: {},
  },
  {
    commandName: "get_selected_element" as const,
    description: "Get the currently selected element",
    apiType: "socket" as const,
    paramsSchema: {},
  },
  {
    commandName: "set_selected_element" as const,
    description: "Set the selected element to target_id",
    apiType: "socket" as const,
    paramsSchema: {
      target_id: z.string(),
    },
  },
  {
    commandName: "set_text_content" as const,
    description: "Set the text content for target_id",
    apiType: "socket" as const,
    paramsSchema: {
      target_id: z.string(),
      text: z.string(),
    },
  },
  {
    commandName: "insert_element_before" as const,
    description: "Insert an element before target_id",
    apiType: "socket" as const,
    paramsSchema: {
      target_id: z.string(),
      new_element_type: z.enum(["Button", "Paragraph"]),
    },
  },
  {
    commandName: "insert_element_after" as const,
    description: "Insert an element after target_id",
    apiType: "socket" as const,
    paramsSchema: {
      target_id: z.string(),
      new_element_type: z.enum(["Button", "Paragraph"]),
    },
  },
  {
    commandName: "prepend_element" as const,
    description: "Prepend an element to target_id",
    apiType: "socket" as const,
    paramsSchema: {
      target_id: z.string(),
      new_element_type: z.enum(["Button", "Paragraph"]),
    },
  },
  {
    commandName: "append_element" as const,
    description: "Append an element to target_id",
    apiType: "socket" as const,
    paramsSchema: {
      target_id: z.string(),
      new_element_type: z.enum(["Button", "Paragraph"]),
    },
  },
  {
    commandName: "set_style_background_color" as const,
    description: "Set the background color (CSS color) for target_id",
    apiType: "socket" as const,
    paramsSchema: {
      target_id: z.string(),
      background_color: z.string(),
    },
  },
];

export type CommandName = (typeof commands)[number]["commandName"];

export type ApiType = (typeof commands)[number]["apiType"];
