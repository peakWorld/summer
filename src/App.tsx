import type { ReactElement } from 'react'
import { Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { ROUTES_CONFIGS } from './pages/routes'
import LoadingOrError from 'components/LoadingOrError'

const DefaultComp = ROUTES_CONFIGS[0].comp

export default function App(): ReactElement {
	return (
		<BrowserRouter>
			<Suspense fallback={<LoadingOrError />}>
				<Routes>
					<Route path='/' element={<DefaultComp />} />
					{ROUTES_CONFIGS.map(({ rid, comp: Comp, ...rest }) => (
						<Route key={rid} element={<Comp />} {...rest} />
					))}
				</Routes>
			</Suspense>
		</BrowserRouter>
	)
}
