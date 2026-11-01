// Art direction and generation settings for the Doyun & Seoyeon wedding
// invitation.
//
// The invitation opens with one continuous film: each clip runs from one still
// to the next (Seedance first and last frame), so consecutive clips meet on
// the same image and the scroll never cuts. Clip ids must match the
// `data-clip` attributes in index.html. A mobile invitation is read on a
// phone, so the film is rendered in portrait only; wider screens show it in a
// phone-width column.

// Appended to every still prompt so all stills share one look.
export const style =
  'cinematic fine-art wedding photography, photorealistic, warm golden-hour light, soft film ' +
  'grain, ivory and champagne-gold palette, shallow depth of field, elegant and calm, ' +
  'no text, no lettering, no logo, no watermark';

// Added to every still that is painted from earlier stills, so the camera and
// light stay locked while the subject changes.
export const continuity =
  'Keep the exact camera angle, lens, framing, lighting, colour palette and photographic style ' +
  'of the reference photo; change only what is described:';

export const formats = {
  portrait: {
    composition:
      'tall vertical 9:16 composition, the subject centred in the lower two thirds of the frame, ' +
      'calm uncluttered space in the top third',
    imageSize: '1152x2048',
    videoResolution: '1080p-SR',
    videoRatio: '9:16',
    frameWidth: 1080,
  },
};

export const sourceFormat = 'portrait';

// Key moments of the film, in order. `from` lists earlier stills used as
// references (the first one sets camera and light).
export const stills = [
  {
    id: 'sealed',
    prompt:
      'Top-down view of a closed square ivory cotton-paper wedding envelope with a delicate ' +
      'blind-embossed floral pattern, its pointed flap sealed with a round ivory wax seal ' +
      'pressed with a small plum blossom, lying on soft cream linen, warm light raking across ' +
      'the paper texture, the envelope filling most of the frame.',
  },
  {
    id: 'opened',
    from: ['sealed'],
    prompt:
      'The wax seal has split and the envelope flap is now folded open, revealing a thick ' +
      'ivory invitation card inside with a soft golden glow spilling out from within the ' +
      'envelope.',
  },
  {
    id: 'gate',
    prompt:
      'A Korean bride and groom seen from behind, walking hand in hand through the open wooden ' +
      'gate of a traditional hanok courtyard, the bride in a flowing ivory silk wedding gown ' +
      'with a long sheer veil, the groom in a slim black tuxedo, curved tiled roofs and a ' +
      'blossoming plum tree, warm golden-hour sunlight streaming through the gate, their faces ' +
      'not visible.',
  },
  {
    id: 'petals',
    from: ['gate'],
    prompt:
      'The couple now stand still under the gate, turned slightly toward each other, and soft ' +
      'white plum blossom petals drift through the golden air around them.',
  },
];

// Each clip animates from one still to the next. A clip that starts where an
// earlier clip ends is animated from that clip's actual last frame, so the
// film never jumps; its `to` still guides where the motion lands.
export const clips = [
  {
    id: 'opening',
    from: 'sealed',
    to: 'opened',
    motion:
      'The wax seal cracks gently and the envelope flap slowly lifts open on its own, a warm ' +
      'golden light glowing out from inside.',
  },
  {
    id: 'reveal',
    from: 'opened',
    to: 'gate',
    motion:
      'The camera glides down into the golden glow of the open envelope, the light blooms to ' +
      'fill the frame and softly fades into the hanok courtyard where the couple walk through ' +
      'the gate.',
  },
  {
    id: 'blossom',
    from: 'gate',
    to: 'petals',
    motion:
      'The couple slow to a stop beneath the gate and turn toward each other as plum blossom ' +
      'petals begin to drift down through the sunlight.',
  },
];

const DETAIL_SHOT =
  'cinematic fine-art wedding photography, photorealistic, warm golden-hour light, soft film ' +
  'grain, ivory and champagne-gold palette, shallow depth of field, no text, no watermark.';

// Single images used as page decoration (not part of the film), written to
// src/assets/<id>.webp.
export const extras = [
  {
    id: 'venue',
    size: '1536x1024',
    width: 1200,
    prompt:
      'An elegant traditional Korean hanok wedding venue courtyard prepared for a ceremony: ' +
      'rows of white chairs on a stone courtyard, an aisle of ivory flowers leading to a ' +
      'wooden pavilion with curved tiled roofs, plum trees in blossom, no people, ' +
      DETAIL_SHOT,
  },
  {
    id: 'gallery-rings',
    size: '1024x1536',
    width: 900,
    prompt:
      'Close-up of a bride and groom holding hands, two simple gold wedding rings, the ivory ' +
      `silk of the gown and a sprig of white plum blossom, faces not in frame, ${DETAIL_SHOT}`,
  },
  {
    id: 'gallery-bouquet',
    size: '1024x1536',
    width: 900,
    prompt:
      'A bridal bouquet of ivory peonies, white ranunculus and plum blossom branches tied with ' +
      `a long silk ribbon, resting on a wooden hanok veranda, ${DETAIL_SHOT}`,
  },
  {
    id: 'gallery-walk',
    size: '1024x1536',
    width: 900,
    prompt:
      'A Korean bride and groom seen from behind walking along a stone wall path beside hanok ' +
      'roofs, her long sheer veil catching the wind, faces not visible, ' +
      DETAIL_SHOT,
  },
];

export const imageSettings = {
  model: 'openai/gpt-image-2.5-flare/text-to-image',
  editModel: 'openai/gpt-image-2.5-flare/edit',
  quality: 'high',
};

export const videoSettings = {
  model: 'bytedance/seedance-2.0-mini/image-to-video',
  duration: 5,
  generateAudio: false,
  // Appended to every clip's motion prompt.
  motionStyle:
    'Smooth slow cinematic motion, no hands appear, no text appears, faces are never shown ' +
    'clearly.',
};

// Scroll playback frames written to src/assets/clips/<id>/<format>/.
export const frameSettings = {
  fps: 24,
  quality: 80,
};

// Atlas Cloud list prices (October 2026), used only for the pre-run estimate.
// Check https://www.atlascloud.ai/models for current rates.
export const estimatePricing = {
  imageUsd: 0.03,
  videoUsdPerSecond: 0.045,
};
