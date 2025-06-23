
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';
import { User, LogOut, Link } from 'lucide-react';
import { GeneratedLinksDialog } from '@/components/GeneratedLinksDialog';

export const AuthButton: React.FC = () => {
  const { user, loading, signInWithGoogle, logout } = useAuth();
  const [linksDialogOpen, setLinksDialogOpen] = useState(false);

  if (loading) {
    return (
      <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
    );
  }

  if (!user) {
    return (
      <Button onClick={signInWithGoogle} variant="outline" size="sm">
        Sign In
      </Button>
    );
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.photoURL || ''} alt={user.displayName || 'User'} />
              <AvatarFallback>
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuItem onClick={() => setLinksDialogOpen(true)}>
            <Link className="mr-2 h-4 w-4" />
            Generated Links
          </DropdownMenuItem>
          <DropdownMenuItem onClick={logout}>
            <LogOut className="mr-2 h-4 w-4" />
            Log Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      <GeneratedLinksDialog 
        open={linksDialogOpen} 
        onOpenChange={setLinksDialogOpen} 
      />
    </>
  );
};
