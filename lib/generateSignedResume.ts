import { createClient } from '@/lib/supabase/server';

export async function generateSignedResume(resumeUrl: string) {
    const supabase = await createClient();
    const resumePath = resumeUrl.split('/resumes/')[1]
    console.log('Resume Path:', resumePath);
    const { data, error } = await supabase.storage
        .from('resumes')
        .createSignedUrl(resumePath, 60 * 60); 

    if (error || !data?.signedUrl) {
        throw new Error(error?.message ?? 'Unable to generate signed URL.');
    }

    return data.signedUrl;
}