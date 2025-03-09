/** @type {import('next').NextConfig} */
const nextConfig = {
	webpack: (config) => {
		config.resolve.fallback = {
			...config.resolve.fallback,
			'pg-native': false,
			pg: false,
			'pg-query-stream': false,
			sqlite3: false,
			mysql: false,
			oracledb: false,
			'better-sqlite3': false,
			tedious: false,
		};
		return config;
	},
};

export default nextConfig;
