'use strict';

const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const hash = await bcrypt.hash('password123', 10);

    // ============================================
    // 1. USERS
    // ============================================
    const ariaId = uuidv4();
    const deoId = uuidv4();
    const makoId = uuidv4();
    const lyraId = uuidv4();
    const kaelId = uuidv4();

    await queryInterface.bulkInsert('users', [
      {
        id: ariaId,
        username: 'aria_sol',
        email: 'aria@example.com',
        password_hash: hash,
        display_name: 'Aria Sol',
        bio: 'Digital painter obsessed with light and shadow. Warm palettes, emotional work.',
        avatar_url: null,
        instagram: 'aria.sol',
        tiktok: 'ariasolart',
        twitter: 'aria_sol',
        website: 'https://ariasol.art',
        role: 'user',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: deoId,
        username: 'deo_demos',
        email: 'deo@example.com',
        password_hash: hash,
        display_name: 'Deo_Demos',
        bio: 'Pixel art and game design enthusiast. Retro vibes, modern precision.',
        avatar_url: null,
        instagram: 'deo_demos',
        tiktok: null,
        twitter: 'deo_demos',
        website: null,
        role: 'admin',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: makoId,
        username: 'mako_draws',
        email: 'mako@example.com',
        password_hash: hash,
        display_name: 'Mako',
        bio: 'Concept artist. Sci-fi and fantasy worlds. Big dreams, bigger brushes.',
        avatar_url: null,
        instagram: 'mako_draws',
        tiktok: 'makoart',
        twitter: 'mako_draws',
        website: 'https://makoart.space',
        role: 'user',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: lyraId,
        username: 'lyra_sketch',
        email: 'lyra@example.com',
        password_hash: hash,
        display_name: 'Lyra',
        bio: 'Traditional meets digital. Ink and watercolor in a pixel world.',
        avatar_url: null,
        instagram: 'lyra.sketch',
        tiktok: null,
        twitter: null,
        website: null,
        role: 'user',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: kaelId,
        username: 'kael_art',
        email: 'kael@example.com',
        password_hash: hash,
        display_name: 'Kael',
        bio: 'Abstract expressionist. Color is my language.',
        avatar_url: null,
        instagram: 'kael.art',
        tiktok: 'kaelabstract',
        twitter: 'kael_art',
        website: 'https://kael.art',
        role: 'user',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);

    // ============================================
    // 2. JAMS (Competitions)
    // ============================================
    const jam1Id = uuidv4();
    const jam2Id = uuidv4();

    await queryInterface.bulkInsert('jams', [
      {
        id: jam1Id,
        title: 'Summer Vibes',
        description: 'Create art that captures the feeling of summer - warm, bright, and alive.',
        cover_image: null,
        start_date: new Date('2024-06-01'),
        end_date: new Date('2024-07-15'),
        theme: 'Summer / Warm Colors',
        rules: 'Any medium. Must include at least one warm color.',
        max_submissions_per_user: 1,
        status: 'active',
        created_by: deoId,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: jam2Id,
        title: 'Dreamscapes',
        description: 'Surreal and dreamlike worlds. Let your imagination run wild.',
        cover_image: null,
        start_date: new Date('2024-07-01'),
        end_date: new Date('2024-08-15'),
        theme: 'Surreal / Dreams',
        rules: 'No AI generated art. Original work only.',
        max_submissions_per_user: 2,
        status: 'active',
        created_by: ariaId,
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);

    // ============================================
    // 3. SUBMISSIONS (Art Posts)
    // ============================================
    const sub1Id = uuidv4();
    const sub2Id = uuidv4();
    const sub3Id = uuidv4();
    const sub4Id = uuidv4();
    const sub5Id = uuidv4();
    const sub6Id = uuidv4();
    const sub7Id = uuidv4();

    await queryInterface.bulkInsert('submissions', [
      {
        id: sub1Id,
        title: 'Golden Hour',
        description: 'A study of warm light filtering through autumn leaves. Oil on canvas, 2024.',
        image_url: 'https://picsum.photos/seed/golden/600/800',
        user_id: ariaId,
        jam_id: jam1Id,
        status: 'published',
        created_at: new Date('2024-06-20'),
        updated_at: new Date('2024-06-20')
      },
      {
        id: sub2Id,
        title: 'Void Walker',
        description: 'Character concept for a sci-fi RPG set in deep space. Digital painting.',
        image_url: 'https://picsum.photos/seed/void/600/800',
        user_id: makoId,
        jam_id: jam2Id,
        status: 'published',
        created_at: new Date('2024-06-22'),
        updated_at: new Date('2024-06-22')
      },
      {
        id: sub3Id,
        title: 'Pixel Forest',
        description: 'A 32x32 pixel art forest scene. Old school game vibes.',
        image_url: 'https://picsum.photos/seed/forest/600/800',
        user_id: deoId,
        jam_id: jam1Id,
        status: 'published',
        created_at: new Date('2024-06-24'),
        updated_at: new Date('2024-06-24')
      },
      {
        id: sub4Id,
        title: 'Dream State',
        description: 'Surreal portrait exploring the boundary between sleep and reality. Mixed media.',
        image_url: 'https://picsum.photos/seed/dream/600/800',
        user_id: ariaId,
        jam_id: jam2Id,
        status: 'published',
        created_at: new Date('2024-06-25'),
        updated_at: new Date('2024-06-25')
      },
      {
        id: sub5Id,
        title: 'Ink Splash',
        description: 'Expressive ink work with a splash of digital color. 2024.',
        image_url: 'https://picsum.photos/seed/ink/600/800',
        user_id: lyraId,
        jam_id: null,
        status: 'published',
        created_at: new Date('2024-06-27'),
        updated_at: new Date('2024-06-27')
      },
      {
        id: sub6Id,
        title: 'Abstract Dreams',
        description: 'Color and form in constant motion. Acrylic on canvas, digital scan.',
        image_url: 'https://picsum.photos/seed/abstract/600/800',
        user_id: kaelId,
        jam_id: jam2Id,
        status: 'published',
        created_at: new Date('2024-06-28'),
        updated_at: new Date('2024-06-28')
      },
      {
        id: sub7Id,
        title: 'Sunset Over Water',
        description: 'A peaceful evening scene with reflections on still water. Oil on canvas.',
        image_url: 'https://picsum.photos/seed/sunset/600/800',
        user_id: makoId,
        jam_id: null,
        status: 'published',
        created_at: new Date('2024-06-29'),
        updated_at: new Date('2024-06-29')
      }
    ]);

    // ============================================
    // 4. VOTES (Ratings 1-5)
    // ============================================
    await queryInterface.bulkInsert('votes', [
      // Golden Hour (sub1) - avg 4.67
      { id: uuidv4(), user_id: deoId, submission_id: sub1Id, value: 5, created_at: new Date(), updated_at: new Date() },
      { id: uuidv4(), user_id: makoId, submission_id: sub1Id, value: 4, created_at: new Date(), updated_at: new Date() },
      { id: uuidv4(), user_id: lyraId, submission_id: sub1Id, value: 5, created_at: new Date(), updated_at: new Date() },

      // Void Walker (sub2) - avg 4.33
      { id: uuidv4(), user_id: ariaId, submission_id: sub2Id, value: 5, created_at: new Date(), updated_at: new Date() },
      { id: uuidv4(), user_id: deoId, submission_id: sub2Id, value: 4, created_at: new Date(), updated_at: new Date() },
      { id: uuidv4(), user_id: kaelId, submission_id: sub2Id, value: 4, created_at: new Date(), updated_at: new Date() },

      // Pixel Forest (sub3) - avg 4.67
      { id: uuidv4(), user_id: ariaId, submission_id: sub3Id, value: 5, created_at: new Date(), updated_at: new Date() },
      { id: uuidv4(), user_id: makoId, submission_id: sub3Id, value: 5, created_at: new Date(), updated_at: new Date() },
      { id: uuidv4(), user_id: lyraId, submission_id: sub3Id, value: 4, created_at: new Date(), updated_at: new Date() },

      // Dream State (sub4) - avg 4.33
      { id: uuidv4(), user_id: makoId, submission_id: sub4Id, value: 4, created_at: new Date(), updated_at: new Date() },
      { id: uuidv4(), user_id: deoId, submission_id: sub4Id, value: 3, created_at: new Date(), updated_at: new Date() },
      { id: uuidv4(), user_id: kaelId, submission_id: sub4Id, value: 5, created_at: new Date(), updated_at: new Date() },

      // Ink Splash (sub5) - avg 4.0
      { id: uuidv4(), user_id: ariaId, submission_id: sub5Id, value: 4, created_at: new Date(), updated_at: new Date() },
      { id: uuidv4(), user_id: kaelId, submission_id: sub5Id, value: 5, created_at: new Date(), updated_at: new Date() },
      { id: uuidv4(), user_id: deoId, submission_id: sub5Id, value: 3, created_at: new Date(), updated_at: new Date() },

      // Abstract Dreams (sub6) - avg 4.33
      { id: uuidv4(), user_id: ariaId, submission_id: sub6Id, value: 4, created_at: new Date(), updated_at: new Date() },
      { id: uuidv4(), user_id: makoId, submission_id: sub6Id, value: 5, created_at: new Date(), updated_at: new Date() },
      { id: uuidv4(), user_id: lyraId, submission_id: sub6Id, value: 4, created_at: new Date(), updated_at: new Date() },

      // Sunset Over Water (sub7) - avg 4.67
      { id: uuidv4(), user_id: ariaId, submission_id: sub7Id, value: 5, created_at: new Date(), updated_at: new Date() },
      { id: uuidv4(), user_id: deoId, submission_id: sub7Id, value: 5, created_at: new Date(), updated_at: new Date() },
      { id: uuidv4(), user_id: lyraId, submission_id: sub7Id, value: 4, created_at: new Date(), updated_at: new Date() }
    ]);

    // ============================================
    // 5. COMMENTS
    // ============================================
    const comment1Id = uuidv4();
    const comment2Id = uuidv4();
    const comment3Id = uuidv4();
    const comment4Id = uuidv4();
    const comment5Id = uuidv4();
    const comment6Id = uuidv4();

    await queryInterface.bulkInsert('comments', [
      // Comments on Golden Hour
      {
        id: comment1Id,
        content: 'The lighting in this is incredible, love the warm tones!',
        user_id: makoId,
        submission_id: sub1Id,
        parent_id: null,
        likes: 3,
        dislikes: 0,
        created_at: new Date('2024-06-21'),
        updated_at: new Date('2024-06-21')
      },
      {
        id: uuidv4(),
        content: 'Autumn vibes perfectly captured. Beautiful work Aria!',
        user_id: deoId,
        submission_id: sub1Id,
        parent_id: null,
        likes: 2,
        dislikes: 0,
        created_at: new Date('2024-06-22'),
        updated_at: new Date('2024-06-22')
      },
      // Reply to comment1
      {
        id: uuidv4(),
        content: 'Thank you! I spent weeks on the color palette ',
        user_id: ariaId,
        submission_id: sub1Id,
        parent_id: comment1Id,
        likes: 2,
        dislikes: 0,
        created_at: new Date('2024-06-23'),
        updated_at: new Date('2024-06-23')
      },

      // Comments on Void Walker
      {
        id: comment2Id,
        content: 'This character design is so clean! Love the silhouette.',
        user_id: ariaId,
        submission_id: sub2Id,
        parent_id: null,
        likes: 4,
        dislikes: 0,
        created_at: new Date('2024-06-23'),
        updated_at: new Date('2024-06-23')
      },
      {
        id: uuidv4(),
        content: 'The glow effects are amazing. Sci-fi vibes all day.',
        user_id: kaelId,
        submission_id: sub2Id,
        parent_id: null,
        likes: 2,
        dislikes: 0,
        created_at: new Date('2024-06-24'),
        updated_at: new Date('2024-06-24')
      },

      // Comments on Pixel Forest
      {
        id: comment3Id,
        content: 'The pixel work on the trees is so satisfying to look at.',
        user_id: ariaId,
        submission_id: sub3Id,
        parent_id: null,
        likes: 3,
        dislikes: 0,
        created_at: new Date('2024-06-25'),
        updated_at: new Date('2024-06-25')
      },
      {
        id: uuidv4(),
        content: 'Makes me want to play a retro RPG right now! ',
        user_id: makoId,
        submission_id: sub3Id,
        parent_id: null,
        likes: 2,
        dislikes: 0,
        created_at: new Date('2024-06-25'),
        updated_at: new Date('2024-06-25')
      },

      // Comments on Dream State
      {
        id: comment4Id,
        content: 'This is hauntingly beautiful. The ambiguity is what makes it work.',
        user_id: makoId,
        submission_id: sub4Id,
        parent_id: null,
        likes: 3,
        dislikes: 0,
        created_at: new Date('2024-06-26'),
        updated_at: new Date('2024-06-26')
      },
      {
        id: comment5Id,
        content: 'I love how you played with depth and perspective here.',
        user_id: deoId,
        submission_id: sub4Id,
        parent_id: null,
        likes: 2,
        dislikes: 1,
        created_at: new Date('2024-06-26'),
        updated_at: new Date('2024-06-26')
      },

      // Comments on Abstract Dreams
      {
        id: comment6Id,
        content: 'The colors in this are electric. Pure emotion on canvas.',
        user_id: ariaId,
        submission_id: sub6Id,
        parent_id: null,
        likes: 4,
        dislikes: 0,
        created_at: new Date('2024-06-28'),
        updated_at: new Date('2024-06-28')
      },
      {
        id: uuidv4(),
        content: 'Feels like you captured a feeling rather than a thing. Beautiful.',
        user_id: makoId,
        submission_id: sub6Id,
        parent_id: null,
        likes: 3,
        dislikes: 0,
        created_at: new Date('2024-06-29'),
        updated_at: new Date('2024-06-29')
      },

      // Comments on Sunset Over Water
      {
        id: uuidv4(),
        content: 'The reflections on the water are so peaceful. Great work!',
        user_id: ariaId,
        submission_id: sub7Id,
        parent_id: null,
        likes: 2,
        dislikes: 0,
        created_at: new Date('2024-06-30'),
        updated_at: new Date('2024-06-30')
      }
    ]);

    await queryInterface.bulkInsert('follows', [
      { id: uuidv4(), follower_id: deoId, following_id: ariaId, created_at: new Date(), updated_at: new Date() },
      { id: uuidv4(), follower_id: makoId, following_id: ariaId, created_at: new Date(), updated_at: new Date() },
      { id: uuidv4(), follower_id: ariaId, following_id: deoId, created_at: new Date(), updated_at: new Date() },
      { id: uuidv4(), follower_id: lyraId, following_id: makoId, created_at: new Date(), updated_at: new Date() },
      { id: uuidv4(), follower_id: kaelId, following_id: ariaId, created_at: new Date(), updated_at: new Date() },
      { id: uuidv4(), follower_id: ariaId, following_id: makoId, created_at: new Date(), updated_at: new Date() }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    // Delete in reverse order (children before parents)
    await queryInterface.bulkDelete('follows', null, {});
    await queryInterface.bulkDelete('comments', null, {});
    await queryInterface.bulkDelete('votes', null, {});
    await queryInterface.bulkDelete('submissions', null, {});
    await queryInterface.bulkDelete('jams', null, {});
    await queryInterface.bulkDelete('users', null, {});
  }
};