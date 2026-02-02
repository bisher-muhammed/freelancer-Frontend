"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiPrivate } from "@/lib/apiPrivate";
import ZegoMeeting from "@/lib/hooks/ZegoMeeting";

export default function FreelancerMeetingRoom() {
  const { id } = useParams();
  const router = useRouter();

  const [meeting, setMeeting] = useState(null);

  useEffect(() => {
    if (!id) return;
    apiPrivate.get(`/meetings/${id}/`).then(res => {
      setMeeting(res.data);
    });
  }, [id]);

  if (!meeting || !meeting.can_join) {
    return <p>Meeting unavailable</p>;
  }

  const handleMeetingEnd = () => {
    router.replace("/freelancer/meetings");
  };

  return (
    <ZegoMeeting
      meetingId={meeting.id}
      userId={meeting.current_user_id}
      userRole="freelancer"
      onMeetingEnd={handleMeetingEnd}
    />
  );
}
