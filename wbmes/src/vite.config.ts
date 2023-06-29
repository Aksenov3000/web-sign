import { defineConfig } from "vite";
import dts from 'vite-plugin-dts';


export default defineConfig(({ command, mode }) =>
{
	console.log("defineConfig - " + command);

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
		}
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
					fileName: (format) => `index.js`
				},
				outDir: 'build',
				emptyOutDir: true,
			},
			plugins: [dts()]
		}
	}
});
