export const expand = {
	initial: {
		top: 0,
		height: '100vh', // Commence directement avec l'écran couvert
	},
	enter: (i: number) => ({
		top: '100vh',
		transition: {
			duration: 0.4,
			delay: 0.05 * i,
			ease: [0.215, 0.61, 0.355, 1],
		},
		transitionEnd: { height: '0', top: '0' },
	}),
	exit: {
		// Pas d'animation de sortie - l'écran est instantanément couvert
		height: '100vh',
		transition: {
			duration: 0,
		},
	},
}

export const opacity = {
	initial: {
		opacity: 0.5,
	},
	enter: {
		opacity: 0,
		transition: {
			duration: 0.4,
		},
	},
	exit: {
		opacity: 0.5,
		transition: {
			duration: 0, // Instantané
		},
	},
}
