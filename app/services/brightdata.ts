import axios from 'axios'

const BRIGHT_DATA_API_KEY = process.env.BRIGHT_DATA_API_KEY!

export class BrightDataService {
	private static async makeRequest(endpoint: string, data: any[]) {
		try {
			const response = await axios.post(
				`https://api.brightdata.com/datasets/v3/trigger?dataset_id=${endpoint}&include_errors=true`,
				JSON.stringify(data),
				{
					headers: {
						Authorization: `Bearer ${BRIGHT_DATA_API_KEY}`,
						'Content-Type': 'application/json',
					},
				}
			)
			return response.data
		} catch (error) {
			console.error('Erreur API Bright Data:', error)
			throw error
		}
	}

	static async getProfileData(url: string) {
		const data = [
			{
				url: url,
				country: '',
			},
		]

		return await this.makeRequest('gd_l1villgoiiidt09ci', data)
	}

	static async getVideoDetails(videoUrls: string[]) {
		const data = videoUrls.map((url) => ({
			url: url,
			country: '',
		}))

		return await this.makeRequest('gd_lu702nij2f790tmv9h', data)
	}

	static async waitForResults(snapshotId: string, maxWaitTime = 3600000) {
		// 60 minutes
		const startTime = Date.now()
		let attempts = 0

		while (Date.now() - startTime < maxWaitTime) {
			attempts++
			try {
				const response = await axios.get(
					`https://api.brightdata.com/datasets/v3/snapshot/${snapshotId}?format=json`,
					{
						headers: {
							Authorization: `Bearer ${BRIGHT_DATA_API_KEY}`,
						},
					}
				)

				console.log(
					`📊 Statut du snapshot: ${response.data.status} (tentative ${attempts})`
				)

				if (attempts % 10 === 1) {
					console.log(
						'🔍 Réponse complète (tentative',
						attempts,
						'):',
						JSON.stringify(response.data, null, 2).substring(0, 200) + '...'
					)
				}

				if (Array.isArray(response.data) && response.data.length > 0) {
					console.log(`🎉 Données trouvées directement dans response.data !`)
					return { data: response.data }
				}

				if (response.data.status === 'ready') {
					return response.data
				}

				if (
					response.data.data &&
					Array.isArray(response.data.data) &&
					response.data.data.length > 0
				) {
					console.log(`🎉 Données trouvées dans response.data.data !`)
					return response.data
				}

				if (
					response.data &&
					typeof response.data === 'object' &&
					!response.data.status
				) {
					console.log(`🎉 Données directes trouvées sans statut !`)
					return response.data
				}

				if (
					attempts > 100 &&
					response.data &&
					typeof response.data === 'object'
				) {
					if (
						response.data.status === 'running' ||
						response.data.status === 'pending'
					) {
						console.log(
							`⏳ Statut encore en cours (${response.data.status}), attente supplémentaire...`
						)
						await new Promise((resolve) => setTimeout(resolve, 30000))
						continue
					}

					console.log(
						`⚠️ Acceptation des données partielles après ${attempts} tentatives`
					)
					return response.data
				}

				await new Promise((resolve) => setTimeout(resolve, 20000))
			} catch (error) {
				console.error('Erreur lors de la vérification du snapshot:', error)
				await new Promise((resolve) => setTimeout(resolve, 30000))
			}
		}

		throw new Error(
			`Timeout: Les résultats n'ont pas été obtenus après ${
				maxWaitTime / 1000 / 60
			} minutes et ${attempts} tentatives`
		)
	}
}
