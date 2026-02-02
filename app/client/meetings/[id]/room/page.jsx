"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiPrivate } from "@/lib/apiPrivate";
import ZegoMeeting from "@/lib/hooks/ZegoMeeting";

export default function ClientMeetingRoom() {
  const { id } = useParams();
  const router = useRouter();

  const [meeting, setMeeting] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    apiPrivate.get(`/meetings/${id}/`).then(res => {
      setMeeting(res.data);
      setLoading(false);
    });
  }, [id]);

  if (loading) return <p>Loading…</p>;
  if (!meeting || !meeting.can_join) return <p>Meeting unavailable</p>;

  const domainRole =
    meeting.current_user_id === meeting.client_id
      ? "client"
      : "freelancer";

  const handleMeetingEnd = () => {
    router.replace(
      domainRole === "client"
        ? "/client/meetings"
        : "/freelancer/meetings"
    );
  };

  return (
    <ZegoMeeting
      meetingId={meeting.id}
      userId={meeting.current_user_id}
      userRole={domainRole}
      onMeetingEnd={handleMeetingEnd}
    />
  );
}
