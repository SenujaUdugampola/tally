"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";

const SettlementPage = () => {
    const params = useParams();
    const router = useRouter();
    const { type, id } = params;

    return <div> {type} {id} </div>;

}

export default SettlementPage;