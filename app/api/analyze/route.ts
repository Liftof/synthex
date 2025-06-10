import { BrightDataService } from '@/app/services/brightdata'
import { NextRequest } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY!,
})

async function analyzeTikTokProfile(url: string) {
	try {
		// 1. Récupérer les données du profil
		console.log('Récupération des données du profil...')
		const profileResponse = await BrightDataService.getProfileData(url)

		if (!profileResponse.snapshot_id) {
			throw new Error("Impossible de démarrer l'analyse du profil")
		}

		// 2. Attendre les résultats du profil
		const profileData = await BrightDataService.waitForResults(
			profileResponse.snapshot_id
		)

		console.log(
			'🔍 Structure des données reçues:',
			JSON.stringify(profileData, null, 2)
		)

		// Vérification plus flexible des données
		if (!profileData) {
			throw new Error('Aucune donnée de profil trouvée')
		}

		// Accepter différents formats de données
		let dataToAnalyze = null
		if (Array.isArray(profileData)) {
			dataToAnalyze = profileData
		} else if (profileData.data && Array.isArray(profileData.data)) {
			dataToAnalyze = profileData.data
		} else if (profileData.data && typeof profileData.data === 'object') {
			dataToAnalyze = [profileData.data]
		} else if (
			profileData &&
			typeof profileData === 'object' &&
			!profileData.status
		) {
			// Données directes dans profileData
			dataToAnalyze = [profileData]
		} else {
			console.log('❌ Structure de données non reconnue')
			console.log('Type de profileData:', typeof profileData)
			console.log(
				'Clés disponibles:',
				profileData ? Object.keys(profileData) : 'null'
			)

			// Si c'est un statut en cours, on attend plus
			if (profileData?.status === 'running') {
				console.log('⚠️ API Bright Data toujours en cours de traitement')
				console.log(
					"💡 Suggestion: Utilisez le mode démo pour tester l'interface"
				)
				throw new Error(
					'Les données ne sont pas encore prêtes. L\'API Bright Data traite encore la requête. Suggestion : Cliquez sur "Démo" pour voir un exemple fonctionnel !'
				)
			}

			throw new Error('Format de données non reconnu')
		}

		console.log(
			'📊 Données à analyser:',
			dataToAnalyze?.length || 0,
			'éléments'
		)

		// Adapter la structure selon la réponse de Bright Data
		let videos = []
		if (dataToAnalyze && dataToAnalyze.length > 0) {
			const firstItem = dataToAnalyze[0]

			// Chercher les vidéos dans différentes propriétés possibles
			videos =
				firstItem?.top_videos || // Bright Data retourne les vidéos dans top_videos !
				firstItem?.videos ||
				firstItem?.top_posts_data ||
				firstItem?.posts ||
				firstItem?.items ||
				[]

			console.log(
				'🎬 Propriétés disponibles dans les données:',
				Object.keys(firstItem || {})
			)

			// Si pas de vidéos trouvées, chercher dans tous les éléments
			if (videos.length === 0) {
				for (const item of dataToAnalyze) {
					if (item && typeof item === 'object') {
						const possibleVideos =
							item.videos || item.top_posts_data || item.posts || item.items
						if (
							possibleVideos &&
							Array.isArray(possibleVideos) &&
							possibleVideos.length > 0
						) {
							videos = possibleVideos
							break
						}
					}
				}
			}
		}

		console.log(`📊 Nombre de vidéos trouvées: ${videos.length}`)

		if (videos.length === 0) {
			console.log('❌ Aucune vidéo trouvée. Structure complète des données:')
			console.log(JSON.stringify(dataToAnalyze, null, 2))

			return {
				error: 'No videos found for this profile',
				profileData: dataToAnalyze?.[0] || null,
				debugInfo: {
					receivedKeys: dataToAnalyze?.[0] ? Object.keys(dataToAnalyze[0]) : [],
					dataStructure: typeof dataToAnalyze,
				},
			}
		}

		// Note: Plus de filtrage par date, on analyse toutes les vidéos disponibles

		// Récupérer le nom d'utilisateur depuis les données du profil
		const username =
			dataToAnalyze?.[0]?.account_id || dataToAnalyze?.[0]?.nickname || 'user'
		console.log("👤 Nom d'utilisateur détecté:", username)

		// Debug : vérifier la structure d'une vidéo
		if (videos.length > 0) {
			console.log(
				'🎬 Exemple de structure vidéo:',
				JSON.stringify(videos[0], null, 2).substring(0, 500) + '...'
			)
		}

		// 3. Trier et sélectionner les meilleures et pires vidéos
		const sortedByEngagement = videos
			.filter((video: any) => (video.playcount || video.views || 0) > 0)
			.map((video: any) => ({
				...video,
				// Normaliser les propriétés selon la structure Bright Data
				views: video.playcount || video.views || 0,
				likes: video.diggcount || video.likes || 0,
				comments: video.commentcount || video.comments || 0,
				shares: video.share_count || video.shares || 0,
				url:
					video.video_url ||
					video.url ||
					(video.video_id
						? `https://www.tiktok.com/@${username}/video/${video.video_id}`
						: ''),
				created_time: video.create_date || video.created_time,
				description: video.description || '',
				engagement_rate:
					(((video.diggcount || video.likes || 0) +
						(video.commentcount || video.comments || 0) +
						(video.share_count || video.shares || 0)) /
						(video.playcount || video.views || 1)) *
					100,
			}))
			.sort((a: any, b: any) => b.engagement_rate - a.engagement_rate)

		const topVideos = sortedByEngagement.slice(0, 10)
		const worstVideos = sortedByEngagement.slice(-10).reverse()

		// 4. Récupérer les détails des vidéos sélectionnées avec la 2ème API
		const selectedVideoUrls = [...topVideos, ...worstVideos]
			.map((video: any) => video.url)
			.filter(
				(url) => url && url.includes('tiktok.com') && url.includes('/video/')
			) // S'assurer que les URLs sont valides

		console.log(
			`🔍 Récupération des détails pour ${selectedVideoUrls.length} vidéos...`
		)
		console.log('URLs sélectionnées:', selectedVideoUrls.slice(0, 3), '...')

		// Debug : vérifier la structure exacte des URLs
		if (selectedVideoUrls.length > 0) {
			console.log("🔗 Exemple d'URL générée:", selectedVideoUrls[0])
		}

		let videoDetails = []
		if (selectedVideoUrls.length > 0) {
			try {
				console.log(
					"🚀 Appel de l'API de détails vidéo avec",
					selectedVideoUrls.length,
					'URLs'
				)
				const videoDetailsResponse = await BrightDataService.getVideoDetails(
					selectedVideoUrls
				)

				if (videoDetailsResponse.snapshot_id) {
					console.log('📊 Attente des détails vidéo...')
					const detailedData = await BrightDataService.waitForResults(
						videoDetailsResponse.snapshot_id
					)

					// Traiter les données détaillées reçues
					if (detailedData.data && Array.isArray(detailedData.data)) {
						videoDetails = detailedData.data
					} else if (Array.isArray(detailedData)) {
						videoDetails = detailedData
					}

					console.log(`✅ ${videoDetails.length} détails vidéo récupérés`)
				}
			} catch (error) {
				console.error(
					'Erreur lors de la récupération des détails vidéo:',
					error
				)
				console.log('⚠️ Continuer avec les données de base uniquement')
				videoDetails = [...topVideos, ...worstVideos] // Fallback sur les données de base
			}
		} else {
			console.log('⚠️ Aucune URL valide pour récupérer les détails')
			videoDetails = [...topVideos, ...worstVideos] // Utiliser les données de base
		}

		return {
			profileSummary: {
				totalVideos: videos.length,
				totalViews: videos.reduce(
					(sum: number, video: any) =>
						sum + (video.playcount || video.views || 0),
					0
				),
				totalLikes: videos.reduce(
					(sum: number, video: any) =>
						sum + (video.diggcount || video.likes || 0),
					0
				),
				totalComments: videos.reduce(
					(sum: number, video: any) =>
						sum + (video.commentcount || video.comments || 0),
					0
				),
				totalShares: videos.reduce(
					(sum: number, video: any) =>
						sum + (video.share_count || video.shares || 0),
					0
				),
				averageEngagement:
					sortedByEngagement.length > 0
						? sortedByEngagement.reduce(
								(sum: number, video: any) => sum + video.engagement_rate,
								0
						  ) / sortedByEngagement.length
						: 0,
			},
			topPerformingVideos: topVideos,
			worstPerformingVideos: worstVideos,
			detailedAnalysis: videoDetails, // Données enrichies de la 2ème API
			enrichedDataCount: videoDetails.length,
			allVideosBasicData: videos.length,
			rawDataSample: videos.slice(0, 2), // Pour debug
		}
	} catch (error) {
		console.error('Erreur dans analyzeTikTokProfile:', error)
		throw error
	}
}

export async function POST(request: NextRequest) {
	try {
		const { url } = await request.json()

		if (!url) {
			return new Response('Missing URL', { status: 400 })
		}

		// Fonction tool pour analyser TikTok
		const tools: OpenAI.Chat.Completions.ChatCompletionTool[] = [
			{
				type: 'function',
				function: {
					name: 'analyze_tiktok_profile',
					description:
						'Analyzes a TikTok profile and returns the best and worst videos with their metrics',
					parameters: {
						type: 'object',
						properties: {
							url: {
								type: 'string',
								description: 'The TikTok profile URL to analyze',
							},
						},
						required: ['url'],
					},
				},
			},
		]

		const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
			{
				role: 'system',
				content: `You are Synthex, an expert in data science and TikTok performance analysis. 

**IMPORTANT**: You will receive REAL DATA already collected via a function call. You must analyze THIS PROVIDED DATA and generate a comprehensive report. You do NOT need to collect data yourself, it will be provided to you.

You must produce a COMPLETE and DETAILED analysis report in English with graphs, tables and strategic recommendations based on the data you will receive.

## EXPECTED REPORT STRUCTURE:

### 📊 QUANTITATIVE ANALYSIS
- **Global Metrics**: Tables with totals (views, likes, shares, comments)
- **Engagement Rate**: Calculations and comparisons with industry averages
- **Performance Distribution**: Video breakdown by performance tiers
- **Temporal Evolution**: Trend analysis over time

### 📈 GRAPHS AND VISUALIZATIONS 
Use markdown to create visual representations:
- Bar charts with ASCII characters
- Detailed comparative tables
- Distribution diagrams
- Performance timeline

### 🎯 QUALITATIVE ANALYSIS
- **Topic Analysis**: Which themes/hashtags perform best/worst
- **Optimal Timing**: Best posting time slots
- **Content Format**: Types of content that engage the most
- **Semantic Analysis**: Recurring keywords in top/flop videos

### 🔍 CROSS-ANALYSIS
- **Correlations**: Views vs engagement, duration vs performance
- **Segmentation**: Video profiles by performance
- **Benchmarking**: Comparison with TikTok standards
- **Temporal Patterns**: Optimal days/hours

### 💡 STRATEGIC RECOMMENDATIONS
- **Priority Actions**: Top 5 improvements to implement
- **Content Optimization**: Topics/formats to prioritize/avoid
- **Editorial Calendar**: Best times to publish
- **KPIs to Track**: Key metrics to measure progress

### 📋 DATA TABLES
MUST present:
- Top 10 videos (with detailed metrics)
- Bottom 10 videos (with failure reasons)
- Breakdown by hashtags/topics
- Day/hour publication analysis

## FORMAT REQUIREMENTS:
- Use **emojis** to structure
- Create detailed **markdown tables**
- Make visual **graphs** and **charts** or **diagrams**
- Use **bullet points** and **numbered lists**
- **Bold** key points
- Add **colored sections** with alerts

## WRITING STYLE:
- Professional yet accessible
- Actionable and concrete insights
- Justify each recommendation with data
- Propose quantified objectives

## FINAL INSTRUCTION:
You MUST generate the complete report based on the provided data. Do NOT refuse to do the analysis on the grounds that you cannot access the data - it is ALREADY provided to you via the function tool. Analyze the received data and generate the requested report.`,
			},
			{
				role: 'user',
				content: `I have collected data from the TikTok profile ${url} via the Bright Data API. Use the analyze_tiktok_profile function to retrieve this data, then generate a comprehensive analysis with statistics, graphs and diagrams, markdown tables and strategic recommendations based on this real data.`,
			},
		]

		// Créer un stream encoder
		const encoder = new TextEncoder()

		const stream = new ReadableStream({
			async start(controller) {
				try {
					const chatCompletion = await openai.chat.completions.create({
						model: 'gpt-4.1',
						messages: messages,
						tools: tools,
						tool_choice: 'auto',
						stream: true,
						temperature: 0.8,
						max_tokens: 4000,
					})

					const functionCallData = {
						name: '',
						arguments: '',
					}
					let isFunctionCall = false
					let analyzingMessageSent = false // Variable pour suivre si le message a été envoyé

					for await (const chunk of chatCompletion) {
						const choice = chunk.choices[0]

						// Gérer les appels de fonction
						if (choice.delta.tool_calls) {
							isFunctionCall = true
							const toolCall = choice.delta.tool_calls[0]

							if (toolCall.function?.name) {
								functionCallData.name = toolCall.function.name
							}
							if (toolCall.function?.arguments) {
								functionCallData.arguments += toolCall.function.arguments
							}
						}

						// Si c'est la fin d'un appel de fonction
						if (isFunctionCall && choice.finish_reason === 'tool_calls') {
							try {
								const args = JSON.parse(functionCallData.arguments)

								// Envoyer un message de statut seulement s'il n'a pas déjà été envoyé
								if (!analyzingMessageSent) {
									const statusMessage = `🔍 Analyzing profile ${args.url}...\n\n`
									controller.enqueue(
										encoder.encode(
											`data: ${JSON.stringify({
												choices: [
													{
														delta: {
															content: statusMessage,
														},
													},
												],
											})}\n\n`
										)
									)
									analyzingMessageSent = true // Marquer comme envoyé
								}

								// Exécuter l'analyse TikTok
								const analysisResult = await analyzeTikTokProfile(args.url)

								// Continuer avec GPT pour interpréter les résultats
								const analysisMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] =
									[
										...messages,
										{
											role: 'assistant',
											content: null,
											tool_calls: [
												{
													id: 'call_analyze',
													type: 'function',
													function: {
														name: 'analyze_tiktok_profile',
														arguments: functionCallData.arguments,
													},
												},
											],
										},
										{
											role: 'tool',
											tool_call_id: 'call_analyze',
											content: JSON.stringify(analysisResult),
										},
									]

								// Nouveau stream pour la réponse finale
								const finalCompletion = await openai.chat.completions.create({
									model: 'gpt-4.1',
									messages: analysisMessages,
									stream: true,
									temperature: 0.8,
									max_tokens: 4000,
								})

								for await (const finalChunk of finalCompletion) {
									const finalChoice = finalChunk.choices[0]
									if (finalChoice.delta.content) {
										controller.enqueue(
											encoder.encode(`data: ${JSON.stringify(finalChunk)}\n\n`)
										)
									}

									if (finalChoice.finish_reason === 'stop') {
										controller.enqueue(encoder.encode(`data: [DONE]\n\n`))
										controller.close()
										return
									}
								}
							} catch (error) {
								console.error("Erreur lors de l'analyse:", error)

								let errorMessage = `❌ Error during analysis:\n\n`

								if (error instanceof Error) {
									if (error.message.includes('400')) {
										errorMessage += `⚠️ Problem with TikTok API - Please try:\n`
										errorMessage += `• Check that the URL is correct\n`
										errorMessage += `• Contact technical support if the problem persists\n\n`
									} else {
										errorMessage += error.message
									}
								} else {
									errorMessage += 'Unknown error'
								}

								controller.enqueue(
									encoder.encode(
										`data: ${JSON.stringify({
											choices: [
												{
													delta: {
														content: errorMessage,
													},
												},
											],
										})}\n\n`
									)
								)
								controller.enqueue(encoder.encode(`data: [DONE]\n\n`))
								controller.close()
								return
							}
						}

						// Gérer le contenu normal (non-function calls)
						if (!isFunctionCall && choice.delta.content) {
							controller.enqueue(
								encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`)
							)
						}

						if (choice.finish_reason === 'stop') {
							controller.enqueue(encoder.encode(`data: [DONE]\n\n`))
							controller.close()
							return
						}
					}
				} catch (error) {
					console.error('Erreur OpenAI:', error)
					const errorMessage = `❌ Error: ${
						error instanceof Error ? error.message : 'Unknown error'
					}\n\n`
					controller.enqueue(
						encoder.encode(
							`data: ${JSON.stringify({
								choices: [
									{
										delta: {
											content: errorMessage,
										},
									},
								],
							})}\n\n`
						)
					)
					controller.enqueue(encoder.encode(`data: [DONE]\n\n`))
					controller.close()
				}
			},
		})

		return new Response(stream, {
			headers: {
				'Content-Type': 'text/event-stream',
				'Cache-Control': 'no-cache',
				Connection: 'keep-alive',
			},
		})
	} catch (error) {
		console.error("Erreur dans l'API:", error)
		return new Response('Server error', { status: 500 })
	}
}
