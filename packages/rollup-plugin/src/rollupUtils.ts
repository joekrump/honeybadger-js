import path from 'node:path'

import type { OutputBundle, OutputAsset, OutputChunk, NormalizedOutputOptions } from 'rollup'
import type { SourcemapInfo } from './types'

/**
 * Extracts the data we need for sourcemap upload from the bundle
 */
export function extractSourcemapDataFromBundle ( 
  outputOptions: NormalizedOutputOptions, 
  bundle: OutputBundle
): SourcemapInfo[] {
  const sourceMaps = Object.values(bundle).filter(isJavascript)
  
  return sourceMaps.map(sourcemap => {
    return formatSourcemapData(outputOptions, sourcemap)
  })
}

function isJavascript(file: OutputAsset | OutputChunk): file is OutputAsset {
  return file.type === 'asset' && file.fileName.endsWith('.js')
}

function formatSourcemapData(
  outputOptions: NormalizedOutputOptions, 
  javascriptFile: OutputAsset): SourcemapInfo {
  // This fileName could include a path like 'subfolder/foo.js'
  const jsFilename = javascriptFile.fileName
  const jsFilePath = path.resolve(outputOptions.dir || '', javascriptFilename)
  // It should be safe to assume that rollup will name the map with 
  // the same name as the js file... however we can pull the file name 
  // from the sourcemap source just in case. 
  let sourcemapFilename = `${jsFilename}.map`;

  const sourcemapFilePath = path.resolve(outputOptions.dir || '', sourcemapFilename)

  return { sourcemapFilename, sourcemapFilePath, jsFilename, jsFilePath }
}

/**
 * Determines if we are in a non-production environment
 * Note that in Vite setups, NODE_ENV should definitely be available
 * In Rollup without Vite, it may or may not be available, 
 * so if it's missing we'll assume prod
 */
export function isNonProdEnv(): boolean {
  return !!process.env.NODE_ENV && process.env.NODE_ENV !== 'production'
}
