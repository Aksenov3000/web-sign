import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

/** Configuration file for ViteJs */
export default defineConfig(({ command }) =>
{
	if (command === 'serve')
	{
		// command === 'serve'
		return {
			server:
			{
				host: '0.0.0.0',
				port: 5173,
				strictPort: true
			}
		};
	}
	else
	{
		// command === 'build'
		return {
			build:
			{
				minify: true,
				reportCompressedSize: true,
				lib:
				{
					entry: ['src/core/index.ts'],
					name: 'web-sign',
					formats: ['cjs'],
					fileName: () => 'index.js'
				},
				outDir: 'build',
				emptyOutDir: true,
			},
			plugins: [dts()]
		};
	}
});
