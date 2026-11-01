import { siteConfig } from '../../config/site';

interface AdSlotProps {
  slotId: string;
  format?: 'horizontal' | 'rectangle';
}

export function AdSlot({ slotId, format = 'horizontal' }: AdSlotProps) {
  if (!siteConfig.ENABLE_ADS) {
    return null;
  }

  return (
    <aside
      aria-label="Advertisement"
      data-ad-slot={slotId}
      data-ad-format={format}
      className="my-12 mx-auto max-w-[680px] min-h-[90px] flex items-center justify-center border border-[#E7E5E0] dark:border-[#262624] rounded-[10px] bg-white dark:bg-[#161616] text-xs text-[#6B6B66]"
    />
  );
}
