
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SearchFiltersProps {
  categories: any[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  selectedCity: string;
  onCityChange: (city: string) => void;
  onReset: () => void;
}

const SearchFilters: React.FC<SearchFiltersProps> = ({
  categories,
  selectedCategory,
  onCategoryChange,
  selectedCity,
  onCityChange,
  onReset
}) => {
  const cities = [
    "İstanbul", "Ankara", "İzmir", "Bursa", "Antalya", "Adana", 
    "Konya", "Gaziantep", "Mersin", "Diyarbakır", "Kayseri", "Eskişehir"
  ];

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Category Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Kategori
          </label>
          <Select value={selectedCategory} onValueChange={onCategoryChange}>
            <SelectTrigger>
              <SelectValue placeholder="Kategori seçin" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Kategoriler</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* City Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Şehir
          </label>
          <Select value={selectedCity} onValueChange={onCityChange}>
            <SelectTrigger>
              <SelectValue placeholder="Şehir seçin" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Şehirler</SelectItem>
              {cities.map((city) => (
                <SelectItem key={city} value={city}>
                  {city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Reset Button */}
        <div className="flex items-end">
          <Button 
            variant="outline" 
            onClick={onReset}
            className="w-full"
          >
            Filtreleri Temizle
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SearchFilters;
