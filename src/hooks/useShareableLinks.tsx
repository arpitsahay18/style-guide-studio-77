import { useState, useEffect } from 'react';
import { collection, addDoc, query, where, getDocs, deleteDoc, doc, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import { BrandGuide } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useBrandGuide } from '@/context/BrandGuideContext';
import { uploadBase64ToStorage } from '@/utils/firebaseStorage';

interface ShareableLink {
  id: string;
  linkId: string;
  url: string;
  createdAt: Date;
  expiresAt: Date;
  brandGuideName: string;
}

interface OptimizedBrandGuide {
  name: string;
  colors: {
    primary: Array<{ 
      hex: string; 
      rgb: string; 
      cmyk: string;
      tints: string[];
      shades: string[];
    }>;
    secondary: Array<{ 
      hex: string; 
      rgb: string; 
      cmyk: string;
      tints: string[];
      shades: string[];
    }>;
    neutral: Array<{ 
      hex: string; 
      rgb: string; 
      cmyk: string;
      tints: string[];
      shades: string[];
    }>;
  };
  typography: any;
  logos: {
    original: string;
    square: Array<{ src: string; background: string; type: string }>;
    rounded: Array<{ src: string; background: string; type: string }>;
    circle: Array<{ src: string; background: string; type: string }>;
  };
}

const optimizeBrandGuideForSharing = async (brandGuide: BrandGuide, colorNames: any, typographyNames: any, typographyVisibility: any, previewText: string, userId: string): Promise<OptimizedBrandGuide> => {
  console.log('Optimizing brand guide for sharing...');
  console.log('Original brand guide:', brandGuide);
  console.log('Color names:', colorNames);
  console.log('Typography names:', typographyNames);
  
  // Upload logo to Firebase Storage if it's a base64 data URL
  let logoUrl = brandGuide.logos.original;
  if (logoUrl && logoUrl.startsWith('data:')) {
    console.log('Uploading main logo to Firebase Storage for sharing...');
    try {
      logoUrl = await uploadBase64ToStorage(logoUrl, userId, 'shared_logo.png');
      console.log('Main logo uploaded successfully:', logoUrl);
    } catch (error) {
      console.error('Error uploading main logo:', error);
    }
  }

  // Upload variation logos if they are base64 data URLs
  const uploadVariations = async (variations: any[]) => {
    if (!variations || variations.length === 0) return [];
    
    return Promise.all(variations.map(async (variation, index) => {
      let src = variation.src;
      if (src && src.startsWith('data:')) {
        try {
          console.log(`Uploading variation ${index} to Firebase Storage...`);
          src = await uploadBase64ToStorage(src, userId, `variation_${index}_${Date.now()}.png`);
          console.log(`Variation ${index} uploaded successfully:`, src);
        } catch (error) {
          console.error(`Error uploading variation ${index}:`, error);
        }
      }
      return {
        src,
        background: variation.background,
        type: variation.type
      };
    }));
  };

  const [squareLogos, roundedLogos, circleLogos] = await Promise.all([
    uploadVariations(brandGuide.logos.square || []),
    uploadVariations(brandGuide.logos.rounded || []),
    uploadVariations(brandGuide.logos.circle || [])
  ]);

  // Create an optimized version with ALL essential data
  const optimized: OptimizedBrandGuide = {
    name: brandGuide.name,
    colors: {
      primary: (brandGuide.colors.primary || []).map(color => ({
        hex: color.hex,
        rgb: color.rgb,
        cmyk: color.cmyk,
        tints: color.tints || [],
        shades: color.shades || []
      })),
      secondary: (brandGuide.colors.secondary || []).map(color => ({
        hex: color.hex,
        rgb: color.rgb,
        cmyk: color.cmyk,
        tints: color.tints || [],
        shades: color.shades || []
      })),
      neutral: (brandGuide.colors.neutral || []).map(color => ({
        hex: color.hex,
        rgb: color.rgb,
        cmyk: color.cmyk,
        tints: color.tints || [],
        shades: color.shades || []
      }))
    },
    typography: brandGuide.typography,
    logos: {
      original: logoUrl,
      square: squareLogos,
      rounded: roundedLogos,
      circle: circleLogos
    }
  };

  console.log('Optimized brand guide:', optimized);
  return optimized;
};

const checkDataSize = (data: any): boolean => {
  const sizeInBytes = new TextEncoder().encode(JSON.stringify(data)).length;
  console.log('Data size:', sizeInBytes, 'bytes');
  return sizeInBytes < 1000000; // 1MB limit
};

export const useShareableLinks = () => {
  const [links, setLinks] = useState<ShareableLink[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const { 
    colorNames, 
    typographyNames, 
    typographyVisibility, 
    previewText
  } = useBrandGuide();

  const fetchLinks = async () => {
    if (!user) {
      setLinks([]);
      return;
    }
    
    setLoading(true);
    try {
      console.log('Fetching shareable links for user:', user.uid);
      
      const q = query(
        collection(db, 'shareableLinks'),
        where('userId', '==', user.uid)
      );
      
      const querySnapshot = await getDocs(q);
      console.log('Found documents:', querySnapshot.size);
      
      const fetchedLinks = querySnapshot.docs
        .map(doc => {
          const data = doc.data();
          const expiresAt = data.expiresAt?.toDate ? data.expiresAt.toDate() : new Date(data.expiresAt);
          
          // Filter out expired links
          if (expiresAt <= new Date()) {
            return null;
          }
          
          return {
            id: doc.id,
            linkId: data.linkId,
            url: `${window.location.origin}/s/${data.linkId}`,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
            expiresAt: expiresAt,
            brandGuideName: data.brandGuide?.name || 'Untitled Brand Guide'
          };
        })
        .filter(link => link !== null) as ShareableLink[];
      
      setLinks(fetchedLinks);
      console.log('Successfully fetched links:', fetchedLinks.length);
    } catch (error: any) {
      console.error('Error fetching links:', error);
      toast({
        variant: "destructive",
        title: "Error fetching links",
        description: "Could not load your shareable links. Please check your Firebase configuration.",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateShareableLink = async (brandGuide: BrandGuide) => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "Please sign in to generate shareable links.",
      });
      return null;
    }

    if (!brandGuide.colors.primary.length || !brandGuide.colors.secondary.length || !brandGuide.logos.original) {
      toast({
        variant: "destructive",
        title: "Incomplete brand guide",
        description: "Please add primary colors, secondary colors, and a logo before sharing.",
      });
      return null;
    }

    try {
      setLoading(true);
      console.log('Generating shareable link for user:', user.uid);
      console.log('Current brand guide data:', brandGuide);
      console.log('Current color names:', colorNames);
      console.log('Current typography names:', typographyNames);
      console.log('Current typography visibility:', typographyVisibility);
      console.log('Current preview text:', previewText);
      
      // Generate unique link ID
      const linkId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      
      // Set expiration to 72 hours from now
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 72);

      // Optimize brand guide data and upload any base64 logos to Firebase
      const optimizedBrandGuide = await optimizeBrandGuideForSharing(
        brandGuide, 
        colorNames, 
        typographyNames, 
        typographyVisibility, 
        previewText,
        user.uid
      );

      const linkData = {
        userId: user.uid,
        linkId,
        brandGuide: optimizedBrandGuide,
        colorNames: colorNames || {},
        typographyNames: typographyNames || {},
        typographyVisibility: typographyVisibility || {
          display: ['large', 'regular'],
          heading: ['h1', 'h2', 'h3'],
          body: ['large', 'medium', 'small']
        },
        previewText: previewText || 'The quick brown fox jumps over the lazy dog',
        createdAt: Timestamp.now(),
        expiresAt: Timestamp.fromDate(expiresAt)
      };

      console.log('Final link data to be saved:', linkData);

      // Check data size before saving
      if (!checkDataSize(linkData)) {
        throw new Error('Brand guide data is too large for sharing. Please reduce the size of your assets.');
      }

      console.log('Creating shareable link with complete data...');

      await addDoc(collection(db, 'shareableLinks'), linkData);
      
      const shareableUrl = `${window.location.origin}/s/${linkId}`;
      
      toast({
        title: "Link generated successfully!",
        description: "Your shareable link is ready. It will expire in 72 hours.",
      });
      
      // Refresh links list
      await fetchLinks();
      
      return shareableUrl;
    } catch (error: any) {
      console.error('Error generating link:', error);
      
      if (error.code === 'permission-denied') {
        toast({
          variant: "destructive",
          title: "Permission denied",
          description: "Unable to create shareable link. Please check your Firebase permissions.",
        });
      } else if (error.code === 'failed-precondition') {
        toast({
          variant: "destructive",
          title: "Database configuration error",
          description: "Missing database indexes. Please follow the setup instructions provided.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Failed to generate link",
          description: error.message || "There was an error creating the shareable link. Please try again.",
        });
      }
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteLink = async (linkId: string) => {
    try {
      await deleteDoc(doc(db, 'shareableLinks', linkId));
      toast({
        title: "Link deleted",
        description: "The shareable link has been removed.",
      });
      await fetchLinks();
    } catch (error: any) {
      console.error('Error deleting link:', error);
      toast({
        variant: "destructive",
        title: "Failed to delete link",
        description: "There was an error removing the link.",
      });
    }
  };

  const copyLinkToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: "Copied!",
        description: "Link copied to clipboard.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Copy failed",
        description: "Could not copy link to clipboard.",
      });
    }
  };

  useEffect(() => {
    if (user) {
      fetchLinks();
    } else {
      setLinks([]);
    }
  }, [user]);

  return {
    links,
    loading,
    generateShareableLink,
    deleteLink,
    copyLinkToClipboard,
    fetchLinks
  };
};
