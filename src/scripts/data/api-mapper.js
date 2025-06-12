import Map from "../utils/map";

export async function storyMapper(story) {
  return {
    id: story.id,
    title: story.name,
    description: story.description,
    evidenceImages: [story.photoUrl],
    storiesName: story.name,
    createdAt: story.createdAt,
    location: {
      latitude: story.lat,
      longitude: story.lon,
      placeName: await Map.getPlaceNameByCoordinate(story.lat, story.lon),
    },
  };
}
