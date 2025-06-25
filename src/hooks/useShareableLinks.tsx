
import { useState, useEffect } from 'react';
import { collection, addDoc, query, where, getDocs, deleteDoc, doc, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import { BrandGuide } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useBrandGuide } from '@/context/BrandGuideContext';

interface ShareableLink {
  id: string;
  url: string;
  createdAt: Date;
  expiresAt: Date;
  brandGuideName: string;
}

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
    if (!user) return;
    
    setLoading(true);
    try {
      const q = query(
        collection(db, 'shareableLinks'),
        where('userId', '==', user.uid),
        where('expiresAt', '>', new Date()),
        orderBy('expiresAt', 'desc'),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const fetchedLinks = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate(),
        expiresAt: doc.data().expiresAt.toDate(),
      })) as ShareableLink[];
      
      setLinks(fetchedLinks);
    } catch (error) {
      console.error('Error fetching links:', error);
      toast({
        variant: "destructive",
        title: "Error fetching links",
        description: "Could not load your shareable links.",
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

    try {
      const linkId = Math.random().toString(36).substring(2, 15);
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 72);

      const linkData = {
        userId: user.uid,
        linkId,
        brandGuide,
        colorNames,
        typographyNames,
        typographyVisibility,
        previewText,
        createdAt: new Date(),
        expiresAt,
        brandGuideName: brandGuide.name || 'Untitled Brand Guide'
      };

      console.log('Saving shareable link data:', linkData);

      await addDoc(collection(db, 'shareableLinks'), linkData);
      
      const shareableUrl = `${window.location.origin}/preview/${linkId}`;
      
      await fetchLinks();
      
      toast({
        title: "Link generated!",
        description: "Your shareable link has been created and copied to clipboard.",
      });

      navigator.clipboard.writeText(shareableUrl);
      
      return shareableUrl;
    } catch (error) {
      console.error('Error generating link:', error);
      toast({
        variant: "destructive",
        title: "Failed to generate link",
        description: "There was an error creating the shareable link.",
      });
      return null;
    }
  };

  const deleteLink = async (linkId: string) => {
    try {
      await deleteDoc(doc(db, 'shareableLinks', linkId));
      await fetchLinks();
      toast({
        title: "Link deleted",
        description: "The shareable link has been removed.",
      });
    } catch (error) {
      console.error('Error deleting link:', error);
      toast({
        variant: "destructive",
        title: "Failed to delete link",
        description: "There was an error removing the link.",
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
    fetchLinks
  };
};
