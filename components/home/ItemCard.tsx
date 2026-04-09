import { Calendar, MapPin, Trash2 } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import { useTranslation } from '@/contexts/TranslationContext';

interface ItemCardProps {
  id: string;
  title: string;
  category: string;
  type: 'lost' | 'found';
  location: string;
  date: string;
  imageUrl: string;
  description: string;
  is_pet?: boolean;
  species?: string;
  pet_name?: string;
  onClick?: () => void;
  onRemove?: () => void;
}

export function ItemCard({ title, category, type, location, date, imageUrl, description, is_pet, species, pet_name, onClick, onRemove }: ItemCardProps) {
  const { t } = useTranslation();
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group relative" onClick={onClick}>
      {onRemove && (
        <button
          aria-label="Remove item"
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          className="absolute top-2 right-2 z-10 p-1.5 rounded-full bg-white/80 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      )}
      <div className="aspect-video w-full overflow-hidden bg-gray-100">
        <ImageWithFallback
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover"
        />
      </div>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="line-clamp-1">
            {is_pet && pet_name ? `${pet_name} (${title})` : title}
          </CardTitle>
          <div className="flex flex-col items-end gap-1 shrink-0">
            {is_pet && (
              <Badge variant="outline" className="text-orange-600 border-orange-300 text-xs">
                🐾 {species ?? t.pet.other}
              </Badge>
            )}
            <Badge variant={type === 'lost' ? 'destructive' : 'default'}>
              {is_pet
                ? type === 'lost' ? t.pet.lostPet : t.pet.foundPet
                : type === 'lost' ? t.itemCard.lost : t.itemCard.found}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600 line-clamp-2 mb-3">{description}</p>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <MapPin className="h-4 w-4" />
            <span>{location}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Calendar className="h-4 w-4" />
            <span>{date}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Badge variant="outline">{category}</Badge>
      </CardFooter>
    </Card>
  );
}

