'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { opacity, expand } from './anim'

interface StairsTransitionProps {
	children: React.ReactNode
	backgroundColor?: string
}

export default function StairsTransition({
	children,
	backgroundColor,
}: StairsTransitionProps) {
	const anim = (variants: any, custom: any = null) => {
		return {
			initial: 'initial',
			animate: 'enter',
			exit: 'exit',
			custom,
			variants,
		}
	}

	const nbOfColumns = 5

	return (
		<div className="relative min-h-screen" style={{ backgroundColor }}>
			<motion.div
				{...anim(opacity)}
				className="fixed inset-0 bg-black pointer-events-none z-10"
			/>
			<div className="fixed inset-0 flex pointer-events-none z-20">
				{[...Array(nbOfColumns)].map((_, i) => {
					return (
						<motion.div
							key={i}
							{...anim(expand, nbOfColumns - i)}
							className="relative h-full w-full bg-black"
						/>
					)
				})}
			</div>
			{children}
		</div>
	)
}
