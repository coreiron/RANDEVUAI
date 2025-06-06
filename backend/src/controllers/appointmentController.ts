import { Request, Response } from 'express';
import { db, COLLECTIONS, createResponse, AuthenticatedRequest } from '../config';
import { Timestamp } from 'firebase-admin/firestore';

export const createAppointment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { shopId, serviceId, date, time, notes, staffId, price } = req.body;
    const userId = req.user?.uid;

    console.log('Creating appointment with data:', { shopId, serviceId, date, time, notes, staffId, price, userId });

    if (!userId) {
      return res.status(401).json(createResponse(false, null, '', 'User not authenticated'));
    }

    // Get shop details
    const shopDoc = await db.collection(COLLECTIONS.SHOPS).doc(shopId).get();
    const shopData = shopDoc.data();
    const shopName = shopData?.name || 'Bilinmeyen İşletme';

    // Get service details
    const serviceDoc = await db.collection(COLLECTIONS.SERVICES).doc(serviceId).get();
    const serviceData = serviceDoc.data();
    const serviceName = serviceData?.name || 'Bilinmeyen Servis';

    // Create appointment date-time
    const [hours, minutes] = time.split(':').map(Number);
    const appointmentDateTime = new Date(date);
    appointmentDateTime.setHours(hours, minutes, 0, 0);

    // Calculate end time (assuming 1 hour default duration)
    const endTime = new Date(appointmentDateTime);
    endTime.setHours(endTime.getHours() + 1);

    const appointmentData: {
      shopId: any;
      serviceId: any;
      userId: string;
      status: string;
      date: Timestamp;
      endTime: Timestamp;
      notes: string;
      price: number;
      createdAt: Timestamp;
      updatedAt: Timestamp;
      userEmail: string;
      userConfirmed: boolean;
      businessConfirmed: boolean;
      staffId?: string;
    } = {
      shopId,
      serviceId,
      userId,
      status: "pending_user_confirmation",
      date: Timestamp.fromDate(appointmentDateTime),
      endTime: Timestamp.fromDate(endTime),
      notes: notes || '',
      price: price || 0,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      userEmail: req.user?.email || '',
      userConfirmed: false,
      businessConfirmed: false,
    };

    console.log('Saving appointment data:', appointmentData);

    if (staffId && staffId !== 'any') {
      appointmentData.staffId = staffId;
    }

    const appointmentRef = await db.collection(COLLECTIONS.APPOINTMENTS).add(appointmentData);
    console.log('Appointment created with ID:', appointmentRef.id);

    res.status(201).json(createResponse(
      true,
      { appointmentId: appointmentRef.id, ...appointmentData },
      'Appointment created successfully'
    ));
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json(createResponse(false, null, '', 'Failed to create appointment'));
  }
};

export const getUserAppointments = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.uid;
    console.log('Fetching appointments for user:', userId);

    if (!userId) {
      return res.status(401).json(createResponse(false, null, '', 'User not authenticated'));
    }

    const appointmentsSnapshot = await db
      .collection(COLLECTIONS.APPOINTMENTS)
      .where('userId', '==', userId)
      .get();

    console.log('Found appointments count:', appointmentsSnapshot.size);

    const appointments = [];

    for (const appointmentDoc of appointmentsSnapshot.docs) {
      const data = appointmentDoc.data();

      // Get shop details including image
      let shopName = "Bilinmeyen İşletme";
      let shopImage = "/placeholder.svg";
      let shopAddress = "Adres bilgisi bulunamadı";

      if (data.shopId) {
        const shopDoc = await db.collection(COLLECTIONS.SHOPS).doc(data.shopId).get();
        if (shopDoc.exists) {
          const shopData = shopDoc.data();
          shopName = shopData?.name || "Bilinmeyen İşletme";
          shopImage = shopData?.images?.main || shopData?.image || shopData?.imageUrl || "/placeholder.svg";
          shopAddress = shopData?.location?.address || shopData?.address || "Adres bilgisi bulunamadı";
        }
      }

      // Get service details
      let serviceName = "Bilinmeyen Servis";
      let serviceDuration = "60";

      if (data.serviceId) {
        const serviceDoc = await db.collection(COLLECTIONS.SERVICES).doc(data.serviceId).get();
        if (serviceDoc.exists) {
          const serviceData = serviceDoc.data();
          serviceName = serviceData?.name || "Bilinmeyen Servis";
          serviceDuration = serviceData?.duration?.toString() || "60";
        }
      }

      // Get staff details
      let staffName = undefined;

      if (data.staffId) {
        const staffDoc = await db.collection(COLLECTIONS.STAFF).doc(data.staffId).get();
        if (staffDoc.exists) {
          const staffData = staffDoc.data();
          staffName = staffData?.name;
        }
      }

      appointments.push({
        id: appointmentDoc.id,
        ...data,
        shopName,
        shopImage,
        shopAddress,
        serviceName,
        serviceDuration,
        staffName,
        address: shopAddress, // Alias for compatibility
        duration: serviceDuration // Alias for compatibility
      });
    }

    // Sort by creation date - most recent first
    const sortedAppointments = appointments.sort((a: any, b: any) => {
      const createdAtA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
      const createdAtB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
      return createdAtB.getTime() - createdAtA.getTime();
    });

    console.log('Returning sorted appointments with shop details:', sortedAppointments.length);

    res.json(createResponse(true, sortedAppointments, 'Appointments retrieved successfully'));
  } catch (error) {
    console.error('Error getting user appointments:', error);
    res.status(500).json(createResponse(false, null, '', 'Failed to get appointments'));
  }
};

export const getBusinessAppointments = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { shopId } = req.params;
    console.log('Fetching appointments for business:', shopId);

    if (!shopId) {
      return res.status(400).json(createResponse(false, null, '', 'Shop ID is required'));
    }

    const appointmentsSnapshot = await db
      .collection(COLLECTIONS.APPOINTMENTS)
      .where('shopId', '==', shopId)
      .orderBy('createdAt', 'desc')
      .get();

    console.log('Found business appointments count:', appointmentsSnapshot.size);

    const appointments = [];

    for (const appointmentDoc of appointmentsSnapshot.docs) {
      const data = appointmentDoc.data();

      // Get customer details
      let userName = "Bilinmeyen Müşteri";
      let userPhone = "";
      let userEmail = "";

      if (data.userId) {
        try {
          const userDoc = await db.collection(COLLECTIONS.USERS).doc(data.userId).get();
          if (userDoc.exists) {
            const userData = userDoc.data();
            userName = userData?.displayName || userData?.name || "Bilinmeyen Müşteri";
            userPhone = userData?.phone || "";
            userEmail = userData?.email || "";
          }
        } catch (error) {
          console.warn('Failed to fetch customer info for user:', data.userId);
        }
      }

      // Get service details
      let serviceName = data.serviceName || "Bilinmeyen Servis";
      let servicePrice = data.price || 0;
      let serviceDuration = data.duration || 60;

      if (data.serviceId) {
        try {
          const serviceDoc = await db.collection(COLLECTIONS.SERVICES).doc(data.serviceId).get();
          if (serviceDoc.exists) {
            const serviceData = serviceDoc.data();
            serviceName = serviceData?.name || serviceName;
            servicePrice = serviceData?.price || servicePrice;
            serviceDuration = serviceData?.duration || serviceDuration;
          }
        } catch (error) {
          console.warn('Failed to fetch service info for service:', data.serviceId);
        }
      }

      // Get staff details
      let staffName = data.staffName || "";
      if (data.staffId) {
        try {
          const staffDoc = await db.collection(COLLECTIONS.STAFF).doc(data.staffId).get();
          if (staffDoc.exists) {
            const staffData = staffDoc.data();
            staffName = staffData?.name || staffName;
          }
        } catch (error) {
          console.warn('Failed to fetch staff info for staff:', data.staffId);
        }
      }

      // Convert Firestore Timestamp to JavaScript Date
      const appointmentDate = data.date?.toDate ? data.date.toDate() : new Date(data.date);
      const createdAtDate = data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt);
      const updatedAtDate = data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt);

      const appointment = {
        id: appointmentDoc.id,
        userId: data.userId,
        shopId: data.shopId,
        serviceId: data.serviceId,
        staffId: data.staffId,
        userName, // API'den dönen alan adını doğru yapalım
        userEmail: userEmail,
        userPhone: userPhone,
        serviceName,
        price: servicePrice,
        duration: serviceDuration,
        staffName,
        date: appointmentDate, // JavaScript Date objesi olarak gönder
        time: data.time,
        status: data.status || 'pending',
        notes: data.notes || '',
        createdAt: createdAtDate, // JavaScript Date objesi olarak gönder
        updatedAt: updatedAtDate // JavaScript Date objesi olarak gönder
      };

      appointments.push(appointment);
    }

    console.log('Processed business appointments:', appointments.length);

    return res.json(createResponse(true, appointments, 'success', 'Business appointments fetched successfully'));
  } catch (error) {
    console.error('Error fetching business appointments:', error);
    return res.status(500).json(createResponse(false, null, '', 'Internal server error'));
  }
};

export const updateAppointmentStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { appointmentId } = req.params;
    const { status, reason } = req.body;

    if (!appointmentId) {
      return res.status(400).json(createResponse(false, null, '', 'Appointment ID is required'));
    }

    const appointmentRef = db.collection(COLLECTIONS.APPOINTMENTS).doc(appointmentId);
    const appointmentDoc = await appointmentRef.get();

    if (!appointmentDoc.exists) {
      return res.status(404).json(createResponse(false, null, '', 'Appointment not found'));
    }

    const appointmentData = appointmentDoc.data();
    const updateData: any = {
      status,
      updatedAt: Timestamp.now(),
    };

    if (reason) {
      updateData.statusReason = reason;
    }

    await appointmentRef.update(updateData);

    res.json(createResponse(true, { id: appointmentId, ...updateData }, 'Appointment status updated successfully'));
  } catch (error) {
    console.error('Error updating appointment status:', error);
    res.status(500).json(createResponse(false, null, '', 'Failed to update appointment status'));
  }
};

export const cancelAppointment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { appointmentId } = req.params;
    const { reason } = req.body;
    const userId = req.user?.uid;

    if (!appointmentId) {
      return res.status(400).json(createResponse(false, null, '', 'Appointment ID is required'));
    }

    const appointmentRef = db.collection(COLLECTIONS.APPOINTMENTS).doc(appointmentId);
    const appointmentDoc = await appointmentRef.get();

    if (!appointmentDoc.exists) {
      return res.status(404).json(createResponse(false, null, '', 'Appointment not found'));
    }

    const updateData = {
      status: 'canceled',
      cancelReason: reason || '',
      canceledBy: 'user',
      canceledByUserId: userId,
      canceledAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };

    await appointmentRef.update(updateData);

    res.json(createResponse(true, { appointmentId }, 'Appointment canceled successfully'));
  } catch (error) {
    console.error('Error canceling appointment:', error);
    res.status(500).json(createResponse(false, null, '', 'Failed to cancel appointment'));
  }
};
