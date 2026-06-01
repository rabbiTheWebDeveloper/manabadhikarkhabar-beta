import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth-store';

// Retrieve credentials
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

const isCloudinaryConfigured = !!(cloudName && apiKey && apiSecret);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
}

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate admin user session
    const cookieStore = await cookies();
    const token = cookieStore.get('kachua_session')?.value;
    if (!token || !verifyToken(token)) {
      return NextResponse.json({ error: 'অননুমোদিত প্রবেশাধিকার! দয়া করে আগে লগইন করুন।' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string || 'default';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 2. If Cloudinary is not configured yet, generate a high-fidelity local/preconfigured response.
    if (!isCloudinaryConfigured) {
      console.log('Cloudinary not configured. Simulating fallback data URL...');
      
      // Determine base64 header
      const mimeType = file.type || 'image/jpeg';
      const base64Data = buffer.toString('base64');
      const dataUrl = `data:${mimeType};base64,${base64Data}`;

      return NextResponse.json({
        success: true,
        url: dataUrl,
        isSimulated: true,
        message: 'বিজ্ঞপ্তি: ক্লাউডিনারি ক্রেডেনশিয়াল সেটআপ করা নেই, তাই ছবিটি লোকাল প্রিভিউ হিসেবে লোড করা হয়েছে। অনুগ্রহ করে .env ফাইলে variables সেট করুন।'
      });
    }

    // 3. Real Cloudinary Connection Upload Stream
    const uploadResult = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: `manabadhikarkhabar/epapers/${folder}`,
          resource_type: 'image',
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      ).end(buffer);
    });

    return NextResponse.json({
      success: true,
      url: uploadResult.secure_url,
      isSimulated: false,
      public_id: uploadResult.public_id
    });

  } catch (error: any) {
    console.error('File compilation error inside file uploader:', error);
    return NextResponse.json({ error: error.message || 'Fatal error uploading file to Cloudinary' }, { status: 500 });
  }
}
