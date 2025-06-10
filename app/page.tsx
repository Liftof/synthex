'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import useToolsStore from '@/stores/useToolsStore'
import { processMessages } from '@/lib/assistant'
import useConversationStore from '@/stores/useConversationStore'

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

	const { addConversationItem, addChatMessage } = useConversationStore()

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
				'Veuillez entrer une URL valide de réseau social (TikTok, Instagram, Twitter/X, Facebook, YouTube)'
			)
			return
		}

		setIsLoading(true)

		try {
			// Créer le message pour l'assistant
			// const message = `Utilise la fonction scrape_social_media_stats pour analyser ce profil ${platform}. URL: ${accountUrl}, Plateforme: ${platform}. Génère ensuite un rapport complet avec les statistiques et insights.`

			const message = `Lancement d'un audit pour le compte ${
				accountUrl.split('/').pop() || accountUrl
			} sur ${platform}.`

			const userMessage = {
				role: 'user' as const,
				content: message,
			}

			const userItem = {
				type: 'message' as const,
				role: 'user' as const,
				content: [{ type: 'input_text' as const, text: message }],
			}

			// Ajouter le message à la conversation
			addConversationItem(userMessage)
			addChatMessage(userItem)

			// Rediriger immédiatement vers la page de résultats
			router.push('/results')

			// Traiter les messages en arrière-plan
			processMessages().catch((error) => {
				console.error('Erreur lors du traitement des messages:', error)
			})
		} catch (error) {
			console.error('Erreur:', error)
			alert("Une erreur s'est produite lors de l'analyse")
			setIsLoading(false)
		}
	}

	return (
		<div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
			<div className="w-full max-w-lg">
				{/* Logo */}
				<div className="fixed top-8 left-0 right-0 flex justify-center mb-8">
					<Image
						src="/synthex_logo.svg"
						alt="Synthex"
						width={200}
						height={60}
						className="object-contain"
					/>
				</div>

				{/* Test navigation link */}
				<div className="fixed top-8 right-8">
					<Link
						href="/results"
						className="text-sm text-gray-600 hover:text-gray-900 underline"
					>
						Test Transition →
					</Link>
				</div>

				{/* Title */}
				<h1 className="text-6xl font-bold text-center mb-2 text-nowrap">
					Social Media Audit
				</h1>
				<p className="text-gray-600 text-center mb-8">
					Generate comprehensive insights and analytics for any social platform
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
							placeholder="https://instagram.com/username"
							className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
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
