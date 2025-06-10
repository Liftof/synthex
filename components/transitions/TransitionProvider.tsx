'use client'

import { AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import StairsTransition from './StairsTransition'

interface TransitionProviderProps {
	children: React.ReactNode
}

export default function TransitionProvider({
	children,
}: TransitionProviderProps) {
	const pathname = usePathname()
	const [isFirstMount, setIsFirstMount] = useState(true)
	const previousPathname = useRef(pathname)

	useEffect(() => {
		// Si le pathname change et ce n'est pas le premier mount
		if (previousPathname.current !== pathname && isFirstMount) {
			setIsFirstMount(false)
		}
		previousPathname.current = pathname
	}, [pathname, isFirstMount])

	// Si c'est le premier mount, on affiche directement les enfants sans transition
	if (isFirstMount) {
		return <>{children}</>
	}

	return (
		<AnimatePresence mode="wait">
			<StairsTransition key={pathname}>{children}</StairsTransition>
		</AnimatePresence>
	)
}
