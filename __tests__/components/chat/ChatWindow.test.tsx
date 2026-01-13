import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ChatWindow } from "@/components/chat/ChatWindow";

const mockSendMessage = jest.fn();
const mockMarkChatAsRead = jest.fn();

jest.mock("@/hooks/useChatMessages", () => ({
  useChatMessages: () => ({
    messages: [],
    loading: false,
    sending: false,
    error: null,
    sendMessage: mockSendMessage,
    markChatAsRead: mockMarkChatAsRead,
  }),
}));

describe("<ChatWindow />", () => {
  beforeEach(() => {
    mockSendMessage.mockClear();
    mockMarkChatAsRead.mockClear();
  });

  it("renders empty state when there are no messages", () => {
    render(<ChatWindow chatId={"c1"} currentUserId={"u1"} />);
    expect(screen.getByText(/No messages yet/i)).toBeInTheDocument();
  });

  it("sends a message on Enter", async () => {
    const user = userEvent.setup();
    render(<ChatWindow chatId={"c1"} currentUserId={"u1"} />);

    const input = screen.getByPlaceholderText(/Type your message/i);
    await user.type(input, "hello{enter}");

    expect(mockSendMessage).toHaveBeenCalledTimes(1);
    expect(mockSendMessage).toHaveBeenCalledWith("hello");
  });
});
