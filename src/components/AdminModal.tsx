const handleSaveItem = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!formNameAr || formPrice === '') {
    alert(
      isAr
        ? 'يرجى إدخال اسم الوجبة والسعر'
        : 'Please provide dish name and price'
    );
    return;
  }

  let finalImageUrl =
    formImageUrl ||
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80';

  let driveFileId = editingItem?.driveFileId;

  /* =====================================================
     IMAGE UPLOAD
  ===================================================== */

  if (selectedFile) {
    if (user && uploadToDriveChecked) {
      setIsUploadingImage(true);

      try {
        const fileName = `item_${Date.now()}_${selectedFile.name.replace(
          /\s+/g,
          '_'
        )}`;

        const uploadRes = await uploadImageToDrive(
          selectedFile,
          fileName
        );

        finalImageUrl = uploadRes.directUrl;
        driveFileId = uploadRes.fileId;
      } catch (err: any) {
        console.error(
          'Drive upload failed, using local/fallback:',
          err
        );

        finalImageUrl =
          filePreview || finalImageUrl;
      } finally {
        setIsUploadingImage(false);
      }
    } else if (filePreview) {
      finalImageUrl = filePreview;
    }
  }

  /* =====================================================
     OPTIONAL FIELDS
     
     IMPORTANT:
     Do NOT send undefined to Firestore.
  ===================================================== */

  const originalPrice =
    formOrigPrice !== ''
      ? Number(formOrigPrice)
      : undefined;

  const calories =
    formCalories !== ''
      ? Number(formCalories)
      : undefined;

  /* =====================================================
     EDIT EXISTING ITEM
  ===================================================== */

  if (editingItem) {
    const updatedList = items.map((it) => {
      if (it.id !== editingItem.id) {
        return it;
      }

      /*
       * Build the item without optional undefined fields.
       */
      const updatedItem: MenuItem = {
        ...it,

        id: it.id,

        name: formNameAr,

        nameEn:
          formNameEn.trim() || formNameAr,

        description: formDescAr,

        descriptionEn:
          formDescEn.trim() || formDescAr,

        price: Number(formPrice),

        category: formCategory,

        image: finalImageUrl,

        preparationTime: formPrepTimeAr,

        preparationTimeEn: formPrepTimeEn,

        isChefSpecial: formIsSpecial,

        isPopular: formIsPopular,

        available: formAvailable,
      };

      /* ================================================
         ORIGINAL PRICE
         
         If empty:
         remove the old originalPrice completely.
      ================================================= */

      if (originalPrice !== undefined) {
        updatedItem.originalPrice = originalPrice;
      } else {
        delete updatedItem.originalPrice;
      }

      /* ================================================
         CALORIES
         
         If empty:
         remove the old calories completely.
      ================================================= */

      if (calories !== undefined) {
        updatedItem.calories = calories;
      } else {
        delete updatedItem.calories;
      }

      /* ================================================
         DRIVE FILE ID
      ================================================= */

      if (driveFileId) {
        updatedItem.driveFileId = driveFileId;
      } else {
        delete updatedItem.driveFileId;
      }

      return updatedItem;
    });

    onUpdateItems(updatedList);
  }

  /* =====================================================
     CREATE NEW ITEM
  ===================================================== */

  else {
    const newItem: MenuItem = {
      id: `item-${Date.now()}`,

      name: formNameAr,

      nameEn:
        formNameEn.trim() || formNameAr,

      description: formDescAr,

      descriptionEn:
        formDescEn.trim() || formDescAr,

      price: Number(formPrice),

      category: formCategory,

      image: finalImageUrl,

      preparationTime: formPrepTimeAr,

      preparationTimeEn: formPrepTimeEn,

      isChefSpecial: formIsSpecial,

      isPopular: formIsPopular,

      available: formAvailable,
    };

    /* Optional: original price */
    if (originalPrice !== undefined) {
      newItem.originalPrice = originalPrice;
    }

    /* Optional: calories */
    if (calories !== undefined) {
      newItem.calories = calories;
    }

    /* Optional: Google Drive file */
    if (driveFileId) {
      newItem.driveFileId = driveFileId;
    }

    onUpdateItems([
      newItem,
      ...items,
    ]);
  }

  /* =====================================================
     RESET FORM
  ===================================================== */

  resetItemForm();

  setActiveTab('items');
};
