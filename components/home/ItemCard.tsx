import { Calendar, MapPin } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';

interface ItemCardProps {
  id: string;
  title: string;
  category: string;
  status: 'lost' | 'found';
  location: string;
  date: string;
  imageUrl: string;
  description: string;
  onClick?: () => void;
}

export function ItemCard({ title, category, status, location, date, imageUrl, description, onClick }: ItemCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer" onClick={onClick}>
      <div className="aspect-video w-full overflow-hidden bg-gray-100">
        <ImageWithFallback 
          src={imageUrl} 
          alt={title}
          className="w-full h-full object-cover"
        />
      </div>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="line-clamp-1">{title}</CardTitle>
          <Badge variant={status === 'lost' ? 'destructive' : 'default'}>
            {status === 'lost' ? 'Lost' : 'Found'}
          </Badge>
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

