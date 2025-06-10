import { MessageItem } from '@/lib/assistant'
import React from 'react'
import ReactMarkdown from 'react-markdown'

interface MessageProps {
	message: MessageItem
}

const Message: React.FC<MessageProps> = ({ message }) => {
	return (
		<div className="text-sm">
			{message.role === 'user' ? (
				<div className="flex justify-end">
					<div>
						<div className="ml-4 rounded-2xl px-4 py-3 md:ml-24 bg-gray-900 text-white font-light shadow-sm">
							<div>
								<div>
									<ReactMarkdown>
										{message.content[0].text as string}
									</ReactMarkdown>
								</div>
							</div>
						</div>
					</div>
				</div>
			) : (
				<div className="flex flex-col">
					<div className="flex">
						<div className="mr-4 rounded-2xl px-4 py-3 md:mr-24 text-gray-900 bg-gray-50 font-light border border-gray-100">
							<div>
								<ReactMarkdown>
									{message.content[0].text as string}
								</ReactMarkdown>
								{message.content[0].annotations &&
									message.content[0].annotations
										.filter(
											(a) =>
												a.type === 'container_file_citation' &&
												a.filename &&
												/\.(png|jpg|jpeg|gif|webp|svg)$/i.test(a.filename)
										)
										.map((a, i) => (
											<img
												key={i}
												src={`/api/container_files/content?file_id=${a.fileId}${
													a.containerId ? `&container_id=${a.containerId}` : ''
												}${
													a.filename
														? `&filename=${encodeURIComponent(a.filename)}`
														: ''
												}`}
												alt={a.filename || ''}
												className="mt-2 max-w-full rounded-lg"
											/>
										))}
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	)
}

export default Message
