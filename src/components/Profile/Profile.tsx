"use client";
import React, { useState, useEffect } from "react";
import styles from "./Profile.module.css";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ScrollShadow } from "@nextui-org/scroll-shadow";
import { useDisclosure } from "@nextui-org/modal";
import Delete from "../Delete/Delete";
import { getAuth, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../firebaseConfig";
import UpgradeButton from "@/components/Billing/UpgradeButton";
import PlanBadge from "@/components/Billing/PlanBadge";
import { useDispatch, useSelector } from "react-redux";
import { resetAISettings } from "@/store/aiSlice";
import { resetChat } from "@/store/chatSlice";
import { resetAuth, selectUserDetailsState } from "@/store/authSlice";

import User from "../../../public/svgs/sidebar/User.svg";

type Props = {
  close: () => void;
};

const Profile = (props: Props) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const userDetails = useSelector(selectUserDetailsState);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [plan, setPlan] = useState<string>("");

  // Load current plan from Firestore
  useEffect(() => {
    const loadPlan = async () => {
      if (!userDetails.uid) return;
      try {
        const ref = doc(db, "users", userDetails.uid);
        const snap = await getDoc(ref);
        const currentPlan = snap.get("plan");
        if (currentPlan) setPlan(currentPlan);
      } catch (e) {
        // silent fail
      }
    };
    loadPlan();
  }, [userDetails.uid]);

  const handleLogout = async () => {
    const auth = getAuth();
    try {
      await signOut(auth);
      await auth.signOut();
      props.close();
      dispatch(resetAISettings());
      dispatch(resetChat());
      dispatch(resetAuth());
      router.push("/");
    } catch (error) {
      console.log("Error logging out:", error);
    }
  };
  const handleDelete = (event: React.MouseEvent) => {
    event.stopPropagation();
    onOpen();
  };
  return (
    <div className={styles.list}>
      <div className={styles.titleContainer}>
        <div className={styles.title}>Profile</div>
      </div>
      <ScrollShadow
        isEnabled={false}
        hideScrollBar
        className="h-[calc(100vh_-_56px)] w-full"
      >
        <div className={styles.listContainer}>
          <div className={styles.profile}>
            <Image
              src={userDetails.profilePic ? userDetails.profilePic : User}
              width={150}
              height={150}
              alt="Profile Empty"
              className={styles.profileImage}
            />
            <div className={styles.profileTextContainer}>
              <div className={styles.profileHeader}>Name</div>
              <div className={styles.profileText}>{userDetails.name}</div>
              <div className={styles.profileHeader}>Email</div>
              <div className={styles.profileText}>{userDetails.email}</div>
            </div>
          </div>
          <div style={{marginTop:24}}>
            <div className={styles.sectionHeader} style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12}}>
              <div style={{fontWeight:600}}>Plan</div>
              <PlanBadge />
            </div>
            {plan !== "pro" && (
              <div style={{marginBottom:24}}>
                <UpgradeButton />
              </div>
            )}
          </div>
          <div className={styles.bottomContainer}>
            <div onClick={handleLogout} className={styles.button}>
              Log Out
            </div>
            <div onClick={handleDelete} className={styles.deleteButton}>
              Delete Account
            </div>
          </div>
        </div>
      </ScrollShadow>
      <Delete isOpen={isOpen} onClose={onClose} delete={handleLogout} />
    </div>
  );
};

export default Profile;
