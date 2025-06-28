
export async function convertImageToBase64(url: string, retries: number = 3): Promise<string> {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      console.log(`Converting image to base64 (attempt ${attempt + 1}):`, url);
      
      const response = await fetch(url, {
        mode: 'cors',
        credentials: 'omit',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          console.log('Successfully converted image to base64');
          resolve(reader.result as string);
        };
        reader.onerror = () => reject(new Error('Failed to convert image to base64'));
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.warn(`Image conversion attempt ${attempt + 1} failed:`, error);
      if (attempt === retries - 1) {
        console.error('All image conversion attempts failed, throwing error');
        throw error;
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  throw new Error('Failed to convert image after all retries');
}
