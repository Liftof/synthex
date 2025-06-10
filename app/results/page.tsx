'use client'
import Assistant from '@/components/assistant'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import useConversationStore from '@/stores/useConversationStore'

export default function Results() {
	const router = useRouter()
	const { conversationItems, chatMessages } = useConversationStore()

	useEffect(() => {
		const hasUserMessages = conversationItems.some(
			(item: any) => item.role === 'user'
		)

		const hasAnalysisStarted = chatMessages.length > 1 || hasUserMessages

		if (!hasAnalysisStarted) {
			router.push('/')
		}
	}, [conversationItems, chatMessages, router])

	return (
		<div className="min-h-screen dots-pattern">
			{/* Header */}
			<div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex items-center justify-between h-16">
						{/* Back button and logo */}
						<div className="flex items-center gap-4">
							<Link
								href="/"
								className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
							>
								<ArrowLeft className="w-5 h-5" />
								<span className="font-medium">Nouvelle analyse</span>
							</Link>
							<div className="h-8 w-px bg-gray-300"></div>
							<Image
								src="/synthex_logo.svg"
								alt="Synthex"
								width={100}
								height={32}
								className="object-contain"
							/>
						</div>

						{/* Title */}
						<h1 className="text-xl font-semibold">
							Social Media Audit Results
						</h1>
					</div>
				</div>
			</div>

			{/* Chat container dans une card blanche */}
			<div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
				<div className="white-card p-6 animate-fade-in">
					<Assistant />
				</div>
			</div>
		</div>
	)
}
