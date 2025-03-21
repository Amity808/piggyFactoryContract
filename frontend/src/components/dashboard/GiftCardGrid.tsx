
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Edit, Share } from "lucide-react";
import { mockGiftCards } from "@/data/mockGiftCards";

export function GiftCardGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {mockGiftCards.map((card) => (
        <Card key={card.id} className="overflow-hidden">
          <div 
            className="w-full h-48 bg-cover bg-center" 
            style={{ 
              backgroundImage: `url(${card.image})`,
              backgroundColor: card.backgroundColor || '#f1f5f9'
            }}
          >
            <div className="w-full h-full flex flex-col justify-center items-center p-4 text-center bg-black/10">
              <h3 className="text-xl font-bold text-white drop-shadow-md">
                {card.amount} {card.currency}
              </h3>
              <p className="text-white font-medium drop-shadow-md">
                {card.message}
              </p>
            </div>
          </div>
          <CardHeader>
            <CardTitle>{card.recipientName}</CardTitle>
            <CardDescription>
              Created: {new Date(card.createdAt).toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Status:</span>
                <span className={`font-medium ${
                  card.status === 'redeemed' ? 'text-green-600' : 
                  card.status === 'pending' ? 'text-amber-600' : 'text-blue-600'
                }`}>
                  {card.status.charAt(0).toUpperCase() + card.status.slice(1)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Expires:</span>
                <span className="font-medium">
                  {new Date(card.expiresAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="grid grid-cols-3 gap-2">
            <Button variant="outline" size="sm" className="w-full">
              <Edit className="mr-1 h-3 w-3" />
              Edit
            </Button>
            <Button variant="outline" size="sm" className="w-full">
              <Share className="mr-1 h-3 w-3" />
              Share
            </Button>
            <Button variant="outline" size="sm" className="w-full">
              <Download className="mr-1 h-3 w-3" />
              Save
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
