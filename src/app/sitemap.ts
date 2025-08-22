import { MetadataRoute } from 'next'
import { dbConnect } from '@/lib/db'
import SonaverseStory from '@/models/SonaverseStory'
import DiaperProduct from '@/models/DiaperProduct'
import PressRelease from '@/models/PressRelease'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://sonaverse.kr'
  
  await dbConnect()
  
  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/products`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/products/manbo-walker`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/products/bodeum-diaper`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/sonaverse-story`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/press`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/inquiry`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
  ]

  try {
    // Dynamic pages - Sonaverse Stories
    const sonaverseStories = await SonaverseStory.find({ is_published: true })
      .select('slug updated_at created_at')
      .lean()
    
    const storyPages = sonaverseStories.map((story: any) => ({
      url: `${baseUrl}/sonaverse-story/${story.slug}`,
      lastModified: story.updated_at ? new Date(story.updated_at) : new Date(story.created_at || Date.now()),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))

    // Dynamic pages - Diaper Products
    const products = await DiaperProduct.find({ is_active: true })
      .select('slug updated_at created_at')
      .lean()
    
    const productPages = products.map((product: any) => ({
      url: `${baseUrl}/products/bodeum-diaper/${product.slug}`,
      lastModified: product.updated_at ? new Date(product.updated_at) : new Date(product.created_at || Date.now()),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))

    // Dynamic pages - Press Releases
    const pressReleases = await PressRelease.find({ is_active: true })
      .select('slug last_updated created_at')
      .lean()
    
    const pressPages = pressReleases.map((press: any) => ({
      url: `${baseUrl}/press/${press.slug}`,
      lastModified: press.last_updated ? new Date(press.last_updated) : new Date(press.created_at || Date.now()),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))

    return [...staticPages, ...storyPages, ...productPages, ...pressPages]
  } catch (error) {
    console.error('Error generating sitemap:', error)
    return staticPages
  }
}