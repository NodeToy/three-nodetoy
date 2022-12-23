import { lazy } from 'react'

const Basic = { Component: lazy(() => import('./basic-example')) }
const SelfHosted = { Component: lazy(() => import('./self-hosted')) }
const Decals = { Component: lazy(() => import('./decals-example')) }
const Advanced = { Component: lazy(() => import('./advanced-example')) }
const Materials = { Component: lazy(() => import('./materials-example')) }
const MultiMaterials = { Component: lazy(() => import('./multimat-example')) }

export const Components = new Map();
Components.set('Basic', Basic);
Components.set('Decals', Decals);
Components.set('Materials', Materials);
Components.set('MultiMaterials', MultiMaterials);
Components.set('Advanced', Advanced);
Components.set('SelfHosted', SelfHosted);

