import { Request, Response } from 'express';
import { db, COLLECTIONS, createResponse, AuthenticatedRequest } from '../config';

export const getAllShops = async (req: Request, res: Response) => {
  try {
    const shopsSnapshot = await db.collection(COLLECTIONS.SHOPS).get();

    const shops = [];

    for (const docSnapshot of shopsSnapshot.docs) {
      const data = docSnapshot.data();

      // Only include active shops (default to true if isActive is undefined)
      const isActive = data.isActive !== false;

      if (isActive) {
        const shopData = {
          id: docSnapshot.id,
          ...data,
          // Fill missing fields with defaults
          name: data.name || "İsimsiz İşletme",
          category: data.category || "other",
          location: data.location || { city: "Belirtilmemiş", district: "Belirtilmemiş" },
          rating: data.rating || { average: 0, count: 0 },
          isActive: true
        };

        shops.push(shopData);
      }
    }

    // Sort by name
    const sortedShops = shops.sort((a, b) => (a.name || "").localeCompare(b.name || ""));

    res.json(createResponse(true, sortedShops, 'Shops retrieved successfully'));
  } catch (error) {
    console.error('Error getting shops:', error);
    res.status(500).json(createResponse(false, null, '', 'Failed to get shops'));
  }
};

export const getShopDetails = async (req: Request, res: Response) => {
  try {
    const { shopId } = req.params;

    if (!shopId) {
      return res.status(400).json(createResponse(false, null, '', 'Shop ID is required'));
    }

    const shopDoc = await db.collection(COLLECTIONS.SHOPS).doc(shopId).get();

    if (!shopDoc.exists) {
      return res.status(404).json(createResponse(false, null, '', 'Shop not found'));
    }

    const shopData = {
      id: shopDoc.id,
      ...shopDoc.data()
    };

    res.json(createResponse(true, shopData, 'Shop details retrieved successfully'));
  } catch (error) {
    console.error('Error getting shop details:', error);
    res.status(500).json(createResponse(false, null, '', 'Failed to get shop details'));
  }
};

export const getShopsByCategory = async (req: Request, res: Response) => {
  try {
    const { category } = req.params;

    if (!category) {
      return res.status(400).json(createResponse(false, null, '', 'Category is required'));
    }

    const shopsSnapshot = await db
      .collection(COLLECTIONS.SHOPS)
      .where('category', '==', category)
      .where('isActive', '==', true)
      .get();

    const shops = shopsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json(createResponse(true, shops, 'Shops by category retrieved successfully'));
  } catch (error) {
    console.error('Error getting shops by category:', error);
    res.status(500).json(createResponse(false, null, '', 'Failed to get shops by category'));
  }
};

export const getUserShops = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.uid;

    if (!userId) {
      return res.status(401).json(createResponse(false, null, '', 'User not authenticated'));
    }

    console.log('🏪 Getting shops for user:', userId);

    const shopsSnapshot = await db
      .collection(COLLECTIONS.SHOPS)
      .where('ownerId', '==', userId)
      .get();

    const shops = shopsSnapshot.docs.map(doc => {
      const data = doc.data();

      // Debug - veriyi detaylı olarak logla
      console.log('🔍 Shop document data for ID:', doc.id);
      console.log('📊 Full data:', JSON.stringify(data, null, 2));
      console.log('🛠️ Services:', data.services);
      console.log('👥 Staff:', data.staff);
      console.log('⏰ Working Hours:', data.workingHours);

      return {
        id: doc.id,
        ...data
      };
    });

    console.log('✅ Returning shops count:', shops.length);

    res.json(createResponse(true, shops, 'User shops retrieved successfully'));
  } catch (error) {
    console.error('Error getting user shops:', error);
    res.status(500).json(createResponse(false, null, '', 'Failed to get user shops'));
  }
};

export const getShopServices = async (req: Request, res: Response) => {
  try {
    const { shopId } = req.params;

    if (!shopId) {
      return res.status(400).json(createResponse(false, null, '', 'Shop ID is required'));
    }

    const servicesSnapshot = await db
      .collection(COLLECTIONS.SERVICES)
      .where('shopId', '==', shopId)
      .get();

    const services = servicesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json(createResponse(true, services, 'Shop services retrieved successfully'));
  } catch (error) {
    console.error('Error getting shop services:', error);
    res.status(500).json(createResponse(false, null, '', 'Failed to get shop services'));
  }
};

export const getShopStaff = async (req: Request, res: Response) => {
  try {
    const { shopId } = req.params;

    if (!shopId) {
      return res.status(400).json(createResponse(false, null, '', 'Shop ID is required'));
    }

    const staffSnapshot = await db
      .collection(COLLECTIONS.STAFF)
      .where('shopId', '==', shopId)
      .get();

    const staff = staffSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json(createResponse(true, staff, 'Shop staff retrieved successfully'));
  } catch (error) {
    console.error('Error getting shop staff:', error);
    res.status(500).json(createResponse(false, null, '', 'Failed to get shop staff'));
  }
};
