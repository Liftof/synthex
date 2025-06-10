'use client'
import StreamingResponse from '@/components/streaming-response'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function Results() {
	const router = useRouter()
	const searchParams = useSearchParams()

	const [isAnalyzing, setIsAnalyzing] = useState(false)
	const [streamingData, setStreamingData] = useState('')

	useEffect(() => {
		// Récupérer l'URL depuis les paramètres de recherche
		const url = searchParams.get('url')

		if (!url) {
			router.push('/')
			return
		}

		// Lancer l'analyse automatiquement
		handleAnalysis(url)
	}, [searchParams, router])

	const handleAnalysis = async (url: string) => {
		setIsAnalyzing(true)
		setStreamingData('')

		try {
			const response = await fetch('/api/analyze', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ url }),
			})

			if (!response.ok) {
				throw new Error('Error during analysis')
			}

			const reader = response.body?.getReader()
			const decoder = new TextDecoder()

			if (reader) {
				while (true) {
					const { done, value } = await reader.read()
					if (done) break

					const chunk = decoder.decode(value)
					const lines = chunk.split('\n')

					for (const line of lines) {
						if (line.startsWith('data: ')) {
							const data = line.slice(6)
							if (data === '[DONE]') {
								setIsAnalyzing(false)
								return
							}
							try {
								const parsed = JSON.parse(data)
								if (
									parsed.choices &&
									parsed.choices[0] &&
									parsed.choices[0].delta &&
									parsed.choices[0].delta.content
								) {
									const newContent = parsed.choices[0].delta.content

									// Vérifier si c'est le message "Analyzing profile" et s'il n'est pas déjà présent
									if (newContent.includes('🔍 Analyzing profile')) {
										setStreamingData((prev) => {
											// Si le message est déjà présent, ne pas l'ajouter
											if (prev.includes('🔍 Analyzing profile')) {
												return prev
											}
											return prev + newContent
										})
									} else {
										// Pour tout autre contenu, l'ajouter normalement
										setStreamingData((prev) => prev + newContent)
									}
								}
							} catch {
								// Ignore parsing errors
							}
						}
					}
				}
			}
		} catch (error) {
			console.error('Error:', error)
			setIsAnalyzing(false)
		}
	}

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
								<span className="font-medium">New analysis</span>
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

			{/* Container principal avec les résultats de l'analyse */}
			<div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
				<div className="animate-fade-in">
					<StreamingResponse content={streamingData} isLoading={isAnalyzing} />
				</div>
			</div>
		</div>
	)
}
