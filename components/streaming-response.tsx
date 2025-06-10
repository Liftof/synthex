'use client'

import { Card } from './ui/card'
import { Loader2 } from 'lucide-react'
import { useEffect, useRef } from 'react'
import ReactMarkdown from 'react-markdown'

interface StreamingResponseProps {
	content: string
	isLoading: boolean
}

export default function StreamingResponse({
	content,
	isLoading,
}: StreamingResponseProps) {
	const contentRef = useRef<HTMLDivElement>(null)
	const containerRef = useRef<HTMLDivElement>(null)

	// Auto-scroll to bottom when content updates
	useEffect(() => {
		if (containerRef.current && content) {
			const scrollToBottom = () => {
				containerRef.current?.scrollTo({
					top: containerRef.current.scrollHeight,
					behavior: 'smooth'
				})
			}
			
			// Delay slightly to ensure content is rendered
			setTimeout(scrollToBottom, 100)
		}
	}, [content])

	return (
		<div className="w-full">
			<Card className="p-6 bg-white shadow-lg">
				<div className="space-y-4">
					<div className="flex items-center gap-3 mb-4">
						<div className="relative">
							<div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
							<div className="absolute inset-0 w-3 h-3 bg-green-500 rounded-full animate-ping"></div>
						</div>
						<h3 className="text-lg font-semibold text-gray-800">
							Real-time AI Analysis
						</h3>
					</div>

					<div 
						ref={containerRef}
						className="bg-gray-50 rounded-lg p-6 min-h-[400px] max-h-[80vh] overflow-y-auto"
					>
						{content ? (
							<div ref={contentRef} className="prose prose-gray max-w-none">
								<ReactMarkdown
									className="text-gray-800"
									components={{
										// Custom styling for different elements
										h1: ({ children }) => (
											<h1 className="text-3xl font-bold mt-8 mb-4 text-gray-900 border-b pb-2">
												{children}
											</h1>
										),
										h2: ({ children }) => (
											<h2 className="text-2xl font-bold mt-6 mb-3 text-gray-900">
												{children}
											</h2>
										),
										h3: ({ children }) => (
											<h3 className="text-xl font-bold mt-4 mb-2 text-gray-800">
												{children}
											</h3>
										),
										p: ({ children }) => (
											<p className="mb-4 text-gray-700 leading-relaxed">
												{children}
											</p>
										),
										ul: ({ children }) => (
											<ul className="mb-4 ml-6 space-y-2 list-disc">
												{children}
											</ul>
										),
										ol: ({ children }) => (
											<ol className="mb-4 ml-6 space-y-2 list-decimal">
												{children}
											</ol>
										),
										li: ({ children }) => (
											<li className="text-gray-700">
												{children}
											</li>
										),
										table: ({ children }) => (
											<div className="overflow-x-auto mb-6">
												<table className="min-w-full bg-white border border-gray-200 rounded-lg">
													{children}
												</table>
											</div>
										),
										thead: ({ children }) => (
											<thead className="bg-gray-50">
												{children}
											</thead>
										),
										th: ({ children }) => (
											<th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b">
												{children}
											</th>
										),
										td: ({ children }) => (
											<td className="px-4 py-3 text-sm text-gray-700 border-b">
												{children}
											</td>
										),
										blockquote: ({ children }) => (
											<blockquote className="border-l-4 border-blue-500 pl-4 py-2 mb-4 bg-blue-50 italic text-gray-700">
												{children}
											</blockquote>
										),
										code: ({ children, className }) => {
											const isBlock = className?.includes('language-')
											if (isBlock) {
												return (
													<div className="bg-gray-900 text-gray-100 p-4 rounded-lg mb-4 overflow-x-auto">
														<code>{children}</code>
													</div>
												)
											}
											return (
												<code className="bg-gray-200 px-2 py-1 rounded text-sm font-mono text-gray-800">
													{children}
												</code>
											)
										},
										strong: ({ children }) => (
											<strong className="font-bold text-gray-900">
												{children}
											</strong>
										),
									}}
								>
									{content}
								</ReactMarkdown>
							</div>
						) : isLoading ? (
							<div className="flex items-center justify-center h-32">
								<div className="flex items-center text-gray-500">
									<Loader2 className="mr-3 h-5 w-5 animate-spin" />
									<span>Analyzing...</span>
								</div>
							</div>
						) : null}

						{isLoading && content && (
							<div className="flex items-center mt-4">
								<div className="inline-block w-2 h-5 bg-purple-500 animate-pulse mr-2"></div>
								<span className="text-sm text-gray-500">Generating analysis...</span>
							</div>
						)}
					</div>
				</div>
			</Card>
		</div>
	)
}
