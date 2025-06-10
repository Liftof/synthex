'use client'

import { Card } from './ui/card'
import { Loader2 } from 'lucide-react'

interface StreamingResponseProps {
	content: string
	isLoading: boolean
}

export default function StreamingResponse({
	content,
	isLoading,
}: StreamingResponseProps) {
	return (
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

				<div className="bg-gray-50 rounded-lg p-6 min-h-[400px] max-h-[600px] overflow-y-auto">
					{content ? (
						<div className="prose prose-sm max-w-none">
							<div
								className="whitespace-pre-wrap text-gray-800"
								dangerouslySetInnerHTML={{
									__html: content
										.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
										.replace(
											/### (.*?)$/gm,
											'<h3 class="text-lg font-bold mt-4 mb-2">$1</h3>'
										)
										.replace(
											/## (.*?)$/gm,
											'<h2 class="text-xl font-bold mt-6 mb-3">$1</h2>'
										)
										.replace(
											/# (.*?)$/gm,
											'<h1 class="text-2xl font-bold mt-8 mb-4">$1</h1>'
										)
										.replace(/\n/g, '<br/>'),
								}}
							/>
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
						<div className="inline-block w-2 h-5 bg-purple-500 animate-pulse ml-1"></div>
					)}
				</div>
			</div>
		</Card>
	)
}
