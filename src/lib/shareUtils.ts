import { domToPng } from 'modern-screenshot';

export async function captureAndShare(
  element: HTMLElement,
  filename: string = 'MySolidStats.png'
): Promise<void> {
  // Wait for fonts to be loaded
  await document.fonts.ready;

  // Small delay to ensure rendering is complete
  await new Promise(resolve => setTimeout(resolve, 200));

  try {
    // Capture with modern-screenshot (better CSS support than html2canvas)
    const dataUrl = await domToPng(element, {
      scale: 3,
      quality: 1,
      backgroundColor: '#F8FAFC',
      style: {
        // Ensure consistent rendering
        transform: 'none',
      },
      filter: (node) => {
        // Filter out any elements that shouldn't be in the export
        if (node instanceof HTMLElement) {
          // Skip elements with data-no-export attribute
          if (node.dataset.noExport === 'true') return false;
        }
        return true;
      }
    });

    // Convert data URL to blob
    const response = await fetch(dataUrl);
    const blob = await response.blob();

    if (!blob) {
      throw new Error('Failed to create image');
    }

    // Try native share first
    const file = new File([blob], filename, { type: 'image/png' });

    if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: 'My SolidStats',
          text: 'Check out my Solidcore stats! #SolidStats'
        });
        return;
      } catch (error) {
        // If user cancelled, don't fall through to download
        if (error instanceof Error && error.name === 'AbortError') {
          return;
        }
        // Otherwise, fall through to download
      }
    }

    // Fallback to download
    downloadBlob(blob, filename);
  } catch (error) {
    console.error('Error capturing image:', error);
    throw new Error('Could not generate image. Please try screenshotting manually!');
  }
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
