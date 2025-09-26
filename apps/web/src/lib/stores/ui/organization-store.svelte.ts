import type { Organization } from '@repo/types/zod';
import { setContext, getContext } from 'svelte';
import { browser } from '$app/environment';

const ORGANIZATION_STORAGE_KEY = 'selectedOrganization';

export class OrganizationStore {
	organization = $state<Organization | undefined>(undefined);

	constructor(organization?: Organization) {
		if (browser) {
			const parsed = JSON.parse(
				localStorage.getItem(ORGANIZATION_STORAGE_KEY) ?? 'null'
			) as Organization | null;
			this.organization = parsed ?? organization;

			if (this.organization) {
				localStorage.setItem(ORGANIZATION_STORAGE_KEY, JSON.stringify(this.organization));
			}
		} else {
			this.organization = organization;
		}
	}

	selectOrganization = (organization?: Organization) => {
		console.log("selectOrganization", organization);
		this.organization = organization;
		if (browser) {
			try {
				if (organization) {
					localStorage.setItem(ORGANIZATION_STORAGE_KEY, JSON.stringify(organization));
				} else {
					localStorage.removeItem(ORGANIZATION_STORAGE_KEY);
				}
			} catch {}
		}
	};
}

const ORGANIZATION_KEY = Symbol('ORGANIZATION');

export function setOrganizationStore(organization?: Organization) {
	return setContext(ORGANIZATION_KEY, new OrganizationStore(organization));
}

export function getOrganizationStore<T = OrganizationStore>() {
	let store = getContext<OrganizationStore | undefined>(ORGANIZATION_KEY);
	if (!store) {
		store = new OrganizationStore();
		setContext(ORGANIZATION_KEY, store);
	}
	return store as unknown as T;
}
