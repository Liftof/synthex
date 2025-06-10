'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import useToolsStore from '@/stores/useToolsStore'

export default function Main() {
	const [accountUrl, setAccountUrl] = useState('')
	const [isLoading, setIsLoading] = useState(false)
	const router = useRouter()

	const {
		setWebSearchEnabled,
		setCodeInterpreterEnabled,
		setFunctionsEnabled,
		setMcpEnabled,
		setFileSearchEnabled,
	} = useToolsStore()

	useEffect(() => {
		// Configurer les outils au chargement de la page
		setWebSearchEnabled(true)
		setCodeInterpreterEnabled(true)
		setFunctionsEnabled(true)
		setMcpEnabled(false)
		setFileSearchEnabled(false)
	}, [
		setWebSearchEnabled,
		setCodeInterpreterEnabled,
		setFunctionsEnabled,
		setMcpEnabled,
		setFileSearchEnabled,
	])

	const extractPlatform = (url: string): string => {
		const lowerUrl = url.toLowerCase()
		if (lowerUrl.includes('tiktok.com')) return 'TikTok'
		if (lowerUrl.includes('instagram.com')) return 'Instagram'
		if (lowerUrl.includes('twitter.com') || lowerUrl.includes('x.com'))
			return 'Twitter'
		if (lowerUrl.includes('facebook.com')) return 'Facebook'
		if (lowerUrl.includes('youtube.com')) return 'YouTube'
		return ''
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!accountUrl) return

		const platform = extractPlatform(accountUrl)
		if (!platform) {
			alert(
				'Please enter a valid social media URL (TikTok, Instagram, Twitter/X, Facebook, YouTube)'
			)
			return
		}

		setIsLoading(true)

		try {
			// Rediriger vers la page de résultats avec l'URL en paramètre
			router.push(`/results?url=${encodeURIComponent(accountUrl)}`)
		} catch (error) {
			console.error('Error:', error)
			alert('An error occurred during the analysis')
			setIsLoading(false)
		}
	}

	return (
		<div className="min-h-screen dots-pattern flex items-center justify-center p-4">
			{/* Logo fixé en haut */}
			<div className="fixed top-8 left-0 right-0 flex justify-center z-10">
				<Image
					src="/synthex_logo.svg"
					alt="Synthex"
					width={200}
					height={60}
					className="object-contain"
				/>
			</div>

			{/* Card principale avec le contenu */}
			<div className="w-full max-w-2xl white-card p-8 animate-fade-in">
				{/* Title */}
				<h1 className="text-5xl font-bold text-center mb-3 text-gray-900">
					Transform Your TikTok Into Strategic Gold
				</h1>
				<p className="text-gray-600 text-center mb-8 text-lg">
					Get precise and tailored insights for your social media strategy.
					Simply share your TikTok URL and receive actionable recommendations to
					boost your brand&apos;s performance.
				</p>

				{/* Form */}
				<form onSubmit={handleSubmit} className="space-y-6">
					{/* Account URL */}
					<div>
						<label
							htmlFor="accountUrl"
							className="block text-sm font-medium text-gray-700 mb-2"
						>
							Account URL
						</label>
						<input
							type="url"
							id="accountUrl"
							value={accountUrl}
							onChange={(e) => setAccountUrl(e.target.value)}
							placeholder="https://www.tiktok.com/@username"
							className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-gray-50 hover:bg-white"
							required
						/>
					</div>

					{/* Submit Button */}
					<button
						type="submit"
						disabled={isLoading}
						className="w-full bg-black text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-800 transition disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
					>
						{isLoading ? (
							<>
								<div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
								<span>Analyzing...</span>
							</>
						) : (
							<>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="20"
									height="20"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
								>
									<circle cx="11" cy="11" r="8"></circle>
									<path d="m21 21-4.35-4.35"></path>
								</svg>
								<span>Start Audit</span>
							</>
						)}
					</button>
				</form>
			</div>
		</div>
	)
}
