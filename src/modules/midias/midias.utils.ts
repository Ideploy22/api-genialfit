export function mediaUrl(key: string, sub: string = "", r2: boolean = false): string {
	if (!key) return "";
	const base = (process.env.API_URL ?? "").replace(/\/$/, "");
	const params = new URLSearchParams();
	if (sub) params.set("sub", sub);
	if (r2) params.set("r2", "true");
	const qs = params.toString() ? `?${params.toString()}` : "";
	return `${base}/midias/${key}${qs}`;
}
