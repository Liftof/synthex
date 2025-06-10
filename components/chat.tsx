'use client'

import React, { useEffect, useRef } from 'react'
import ToolCall from './tool-call'
import Message from './message'
import Annotations from './annotations'
import McpToolsList from './mcp-tools-list'
import McpApproval from './mcp-approval'
import { Item, McpApprovalRequestItem } from '@/lib/assistant'
import LoadingMessage from './loading-message'
import useConversationStore from '@/stores/useConversationStore'

interface ChatProps {
	items: Item[]
	onSendMessage: (message: string) => void
	onApprovalResponse: (approve: boolean, id: string) => void
}

const Chat: React.FC<ChatProps> = ({ items, onApprovalResponse }) => {
	const itemsEndRef = useRef<HTMLDivElement>(null)
	// This state is used to provide better user experience for non-English IMEs such as Japanese
	const { isAssistantLoading } = useConversationStore()

	const scrollToBottom = () => {
		itemsEndRef.current?.scrollIntoView({ behavior: 'instant' })
	}

	useEffect(() => {
		scrollToBottom()
	}, [items])

	return (
		<div className="flex justify-center items-center size-full">
			<div className="flex grow flex-col h-full max-w-4xl gap-2">
				<div className="h-[70vh] overflow-y-auto px-6 flex flex-col">
					<div className="mt-auto space-y-5 pt-4">
						{items.map((item, index) => (
							<React.Fragment key={index}>
								{item.type === 'tool_call' ? (
									<ToolCall toolCall={item} />
								) : item.type === 'message' ? (
									<div className="flex flex-col gap-1">
										<Message message={item} />
										{item.content &&
											item.content[0].annotations &&
											item.content[0].annotations.length > 0 && (
												<Annotations
													annotations={item.content[0].annotations}
												/>
											)}
									</div>
								) : item.type === 'mcp_list_tools' ? (
									<McpToolsList item={item} />
								) : item.type === 'mcp_approval_request' ? (
									<McpApproval
										item={item as McpApprovalRequestItem}
										onRespond={onApprovalResponse}
									/>
								) : null}
							</React.Fragment>
						))}
						{isAssistantLoading && <LoadingMessage />}
						<div ref={itemsEndRef} />
					</div>
				</div>
			</div>
		</div>
	)
}

export default Chat
