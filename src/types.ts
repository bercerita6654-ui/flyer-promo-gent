export type DesignStyle = 'umum' | 'anak' | 'dewasa';

export type AspectRatio = '4:5' | '1:1' | '16:9' | '9:16';

export type AIPlatform = 'midjourney' | 'dalle3' | 'stable-diffusion' | 'google-imagen';

export interface PromptInput {
  brandName: string;
  productName: string;
  packagingInfo: string;
  designStyle: DesignStyle;
  aspectRatio: AspectRatio;
  aiPlatform: AIPlatform;
  includeNegativeSpace: boolean;
  colorTheme: string;
  // New comprehensive settings
  cameraAngle: string;
  lighting: string;
  backgroundProps: string;
  previewTheme: string;
  complexityLevel: 'simple' | 'standard' | 'advanced';
}

export interface SavedPrompt {
  id: string;
  timestamp: number;
  input: PromptInput;
  promptIndo: string;
  promptEng: string;
  isAiEnhanced?: boolean;
  variations?: Array<{ style: string; promptEng: string; promptIndo: string }>;
  selectedVarIndex?: number;
}

export interface Preset {
  name: string;
  icon: string;
  brandName: string;
  productName: string;
  packagingInfo: string;
  designStyle: DesignStyle;
  colorTheme: string;
  description: string;
  cameraAngle: string;
  lighting: string;
  backgroundProps: string;
  previewTheme: string;
}
