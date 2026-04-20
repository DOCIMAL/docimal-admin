// Maps OpenRouter provider slugs → @lobehub/icons ModelProvider keys
const PROVIDER_KEY_MAP: Record<string, string> = {
  'meta-llama': 'meta',
  'mistralai': 'mistral',
  'x-ai': 'xai',
  '01-ai': 'zeroone',
  'google-ai-studio': 'google',
  'google-ai': 'google',
  'togethercomputer': 'togetherai',
  'together': 'togetherai',
  'nousresearch': 'nousresearch',
  'sao10k': 'meta',
  'cognitivecomputations': 'meta',
  'openchat': 'openai',
  'teknium': 'meta',
}

export function normalizeProviderKey(provider: string): string {
  return PROVIDER_KEY_MAP[provider.toLowerCase()] ?? provider.toLowerCase()
}
