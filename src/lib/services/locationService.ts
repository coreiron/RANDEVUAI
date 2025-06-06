
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase";
import { COLLECTIONS } from "../firebase/schema";
import { toast } from "@/components/ui/sonner";

// City type definition
export interface City {
  id: string;
  name: string;
}

// District type definition
export interface District {
  id: string;
  name: string;
  cityId: string;
}

// Neighborhood type definition
export interface Neighborhood {
  id: string;
  name: string;
  districtId: string;
}

// Get all cities
export const getAllCities = async (): Promise<City[]> => {
  try {
    // For now, we'll return test data since we don't have a specific cities collection
    // In a real app, you would fetch this from Firestore
    const testCities = [
      { id: '1', name: 'İstanbul' },
      { id: '2', name: 'Ankara' },
      { id: '3', name: 'İzmir' },
      { id: '4', name: 'Antalya' },
      { id: '5', name: 'Bursa' }
    ];
    return testCities;
  } catch (error) {
    console.error("Error getting cities:", error);
    toast.error("Şehirler getirilirken bir hata oluştu");
    return [];
  }
};

// Get districts by city
export const getDistricts = async (cityId: string): Promise<District[]> => {
  try {
    // For test purposes, return mock data
    const districtsByCity = {
      '1': [
        { id: '1', name: 'Kadıköy', cityId: '1' },
        { id: '2', name: 'Beşiktaş', cityId: '1' },
        { id: '3', name: 'Şişli', cityId: '1' },
        { id: '4', name: 'Beyoğlu', cityId: '1' },
        { id: '5', name: 'Üsküdar', cityId: '1' }
      ],
      '2': [
        { id: '6', name: 'Çankaya', cityId: '2' },
        { id: '7', name: 'Keçiören', cityId: '2' },
        { id: '8', name: 'Mamak', cityId: '2' },
        { id: '9', name: 'Etimesgut', cityId: '2' },
        { id: '10', name: 'Yenimahalle', cityId: '2' }
      ],
      // more sample data for other cities
    };
    
    return districtsByCity[cityId] || [];
  } catch (error) {
    console.error("Error getting districts:", error);
    toast.error("İlçeler getirilirken bir hata oluştu");
    return [];
  }
};

// Get neighborhoods by district
export const getNeighborhoods = async (districtId: string): Promise<Neighborhood[]> => {
  try {
    // For test purposes, return mock data
    const neighborhoodsByDistrict = {
      '1': [
        { id: '1', name: 'Caferağa', districtId: '1' },
        { id: '2', name: 'Fenerbahçe', districtId: '1' },
        { id: '3', name: 'Göztepe', districtId: '1' }
      ],
      '2': [
        { id: '4', name: 'Levent', districtId: '2' },
        { id: '5', name: 'Etiler', districtId: '2' },
        { id: '6', name: 'Ortaköy', districtId: '2' }
      ],
      // more sample data for other districts
    };
    
    return neighborhoodsByDistrict[districtId] || [];
  } catch (error) {
    console.error("Error getting neighborhoods:", error);
    toast.error("Mahalleler getirilirken bir hata oluştu");
    return [];
  }
};
