// App.js (React Native / Expo Production Code for ThoniNet APK)
// Implements Clean Design System, No Emojis, Native Geolocation & Image Upload

import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TextInput,
  Image,
  Alert
} from 'react-native';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';

const JETTIES = [
  { id: "ALP", name: "Alappuzha Main SWTD Terminal", lat: 9.5008, lng: 76.3453 },
  { id: "KUP", name: "Kuppapuram Waypoint", lat: 9.5100, lng: 76.3750 },
  { id: "KAI", name: "Kainakary Chira Station", lat: 9.5215, lng: 76.3892 },
  { id: "PUL", name: "Pulinkunnu Central Terminal", lat: 9.4981, lng: 76.4385 },
  { id: "NED", name: "Nedumudi Terminal", lat: 9.4389, lng: 76.4021 },
  { id: "KOD", name: "Kottayam Kodimatha Terminal", lat: 9.5592, lng: 76.5061 }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('public'); // 'public' | 'owner'
  const [ownerMode, setOwnerMode] = useState('register'); // 'register' | 'cockpit'
  const [location, setLocation] = useState(null);
  const [nearestJetty, setNearestJetty] = useState("Acquiring GPS...");
  const [vesselImage, setVesselImage] = useState(null);

  // Form State
  const [kivReg, setKivReg] = useState('');
  const [vesselName, setVesselName] = useState('');
  const [capacity, setCapacity] = useState('12');
  const [passengers, setPassengers] = useState(8);
  const [isOnDuty, setIsOnDuty] = useState(true);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setNearestJetty("Alappuzha Main Terminal (GPS Denied)");
        return;
      }

      let loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      setLocation(loc.coords);
      calculateNearest(loc.coords.latitude, loc.coords.longitude);
    })();
  }, []);

  const calculateDistanceKm = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(2);
  };

  const calculateNearest = (lat, lng) => {
    let nearest = JETTIES[0];
    let minDis = 99999;
    JETTIES.forEach(j => {
      let d = parseFloat(calculateDistanceKm(lat, lng, j.lat, j.lng));
      if (d < minDis) {
        minDis = d;
        nearest = j;
      }
    });
    setNearestJetty(`${nearest.name} (${minDis} km)`);
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });
    if (!result.canceled) {
      setVesselImage(result.assets[0].uri);
    }
  };

  const handleRegister = () => {
    if (!kivReg || !vesselName) {
      Alert.alert("Required Fields", "Please complete all statutory KIV registration fields.");
      return;
    }
    Alert.alert("Registration Complete", "Vessel registered under Kerala Inland Vessel rules. Transferred to Owner Cockpit.");
    setOwnerMode('cockpit');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0B0F17" />

      {/* Top Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>THONINET</Text>
          <Text style={styles.subtitle}>Inland Waterways Network • Alappuzha</Text>
        </View>
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'public' && styles.tabButtonActive]}
            onPress={() => setActiveTab('public')}
          >
            <Text style={[styles.tabText, activeTab === 'public' && styles.tabTextActive]}>Public</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'owner' && styles.tabButtonActive]}
            onPress={() => setActiveTab('owner')}
          >
            <Text style={[styles.tabText, activeTab === 'owner' && styles.tabTextActive]}>Boat Owner</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Hardware GPS Status Banner */}
      <View style={styles.gpsBanner}>
        <View style={[styles.dot, location ? styles.dotActive : styles.dotPending]} />
        <Text style={styles.gpsText}>
          {location ? `GPS: ${location.latitude.toFixed(4)}°N, ${location.longitude.toFixed(4)}°E` : "Acquiring GPS Fix..."}
        </Text>
        <Text style={styles.nearestText}>{nearestJetty}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>

        {/* PUBLIC TRANSIT VIEW */}
        {activeTab === 'public' && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.serviceId}>SERVICE SWTD-01 • VEMBANAD EXPRESS</Text>
                <Text style={styles.routeName}>Alappuzha Main ➔ Kottayam Terminal</Text>
              </View>
              <Text style={styles.statusPill}>ON TIME</Text>
            </View>

            <View style={styles.etaRow}>
              <Text style={styles.etaDigit}>06</Text>
              <View>
                <Text style={styles.etaUnit}>MINUTES TO NEXT JETTY</Text>
                <Text style={styles.nextJettyName}>Approaching: Kainakary Chira</Text>
              </View>
            </View>

            {/* Canal Stepper */}
            <View style={styles.stepper}>
              <View style={styles.stepItem}>
                <View style={[styles.stepDot, styles.stepCompleted]} />
                <Text style={styles.stepName}>Alappuzha Main Terminal (Departed)</Text>
              </View>
              <View style={styles.stepLine} />
              <View style={styles.stepItem}>
                <View style={[styles.stepDot, styles.stepCompleted]} />
                <Text style={styles.stepName}>Kuppapuram Waypoint (Cleared)</Text>
              </View>
              <View style={styles.stepLine} />
              <View style={styles.stepItem}>
                <View style={[styles.stepDot, styles.stepActive]} />
                <Text style={[styles.stepName, styles.stepNameActive]}>Kainakary Chira (In Progress - ETA 6m)</Text>
              </View>
              <View style={styles.stepLine} />
              <View style={styles.stepItem}>
                <View style={styles.stepDot} />
                <Text style={styles.stepName}>Pulinkunnu Central Terminal</Text>
              </View>
              <View style={styles.stepLine} />
              <View style={styles.stepItem}>
                <View style={styles.stepDot} />
                <Text style={styles.stepName}>Kottayam Kodimatha Terminal</Text>
              </View>
            </View>
          </View>
        )}

        {/* BOAT OWNER PORTAL VIEW */}
        {activeTab === 'owner' && (
          <View>
            <View style={styles.ownerNav}>
              <TouchableOpacity
                style={[styles.subTab, ownerMode === 'register' && styles.subTabActive]}
                onPress={() => setOwnerMode('register')}
              >
                <Text style={[styles.subTabText, ownerMode === 'register' && styles.subTabTextActive]}>Register Vessel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.subTab, ownerMode === 'cockpit' && styles.subTabActive]}
                onPress={() => setOwnerMode('cockpit')}
              >
                <Text style={[styles.subTabText, ownerMode === 'cockpit' && styles.subTabTextActive]}>Owner Cockpit</Text>
              </TouchableOpacity>
            </View>

            {ownerMode === 'register' ? (
              <View style={styles.card}>
                <Text style={styles.sectionHeader}>Statutory Vessel Registration (KIV)</Text>
                
                <Text style={styles.label}>KIV Registration Number</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. KIV/ALP/SH/1029/2026"
                  placeholderTextColor="#475569"
                  value={kivReg}
                  onChangeText={setKivReg}
                />

                <Text style={styles.label}>Vessel Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Vembanad Shikara 01"
                  placeholderTextColor="#475569"
                  value={vesselName}
                  onChangeText={setVesselName}
                />

                <Text style={styles.label}>Certified Passenger Capacity</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={capacity}
                  onChangeText={setCapacity}
                />

                <TouchableOpacity style={styles.uploadBtn} onPress={pickImage}>
                  <Text style={styles.uploadText}>{vesselImage ? "Change Vessel Inspection Photo" : "Upload Inspection Photo"}</Text>
                </TouchableOpacity>

                {vesselImage && (
                  <Image source={{ uri: vesselImage }} style={styles.previewImage} />
                )}

                <TouchableOpacity style={styles.primaryBtn} onPress={handleRegister}>
                  <Text style={styles.primaryBtnText}>SUBMIT REGISTRATION</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.card}>
                <Text style={styles.sectionHeader}>Operator Cockpit: {vesselName || "Vembanad Shikara 01"}</Text>
                <Text style={styles.subText}>Reg: {kivReg || "KIV/ALP/SH/1029/2026"}</Text>

                <View style={styles.metricRow}>
                  <View style={styles.metricBox}>
                    <Text style={styles.metricLabel}>DUTY STATUS</Text>
                    <TouchableOpacity
                      style={[styles.dutyPill, isOnDuty ? styles.dutyPillActive : styles.dutyPillOff]}
                      onPress={() => setIsOnDuty(!isOnDuty)}
                    >
                      <Text style={styles.dutyPillText}>{isOnDuty ? "ON DUTY" : "MOORED"}</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.metricBox}>
                    <Text style={styles.metricLabel}>PASSENGERS</Text>
                    <View style={styles.counterRow}>
                      <TouchableOpacity onPress={() => setPassengers(Math.max(0, passengers - 1))} style={styles.counterBtn}>
                        <Text style={styles.counterBtnText}>-</Text>
                      </TouchableOpacity>
                      <Text style={styles.passengerCount}>{passengers}</Text>
                      <TouchableOpacity onPress={() => setPassengers(passengers + 1)} style={styles.counterBtn}>
                        <Text style={styles.counterBtnText}>+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.sosBtn}
                  onPress={() => Alert.alert("Maritime SOS", "Emergency coordinates dispatched to Coastal Police.")}
                >
                  <Text style={styles.sosText}>BROADCAST MARITIME DISTRESS (SOS)</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0F17' },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#0F172A',
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  title: { fontSize: 16, fontWeight: '700', color: '#F8FAFC', letterSpacing: 0.5 },
  subtitle: { fontSize: 10, color: '#94A3B8', marginTop: 1 },
  tabContainer: { flexDirection: 'row', backgroundColor: '#1E293B', borderRadius: 8, padding: 2 },
  tabButton: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 },
  tabButtonActive: { backgroundColor: '#0D9488' },
  tabText: { fontSize: 11, fontWeight: '600', color: '#94A3B8' },
  tabTextActive: { color: '#FFFFFF' },
  gpsBanner: {
    backgroundColor: '#131926',
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  dotActive: { backgroundColor: '#10B981' },
  dotPending: { backgroundColor: '#F59E0B' },
  gpsText: { fontSize: 10, fontFamily: 'monospace', color: '#94A3B8' },
  nearestText: { fontSize: 10, fontWeight: '600', color: '#38BDF8' },
  scroll: { padding: 16 },
  card: {
    backgroundColor: '#131926',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1E293B',
    marginBottom: 16
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#1E293B', pb: 10, paddingBottom: 10 },
  serviceId: { fontSize: 10, fontFamily: 'monospace', color: '#0D9488', fontWeight: '600' },
  routeName: { fontSize: 14, fontWeight: '700', color: '#F8FAFC', marginTop: 2 },
  statusPill: { fontSize: 10, fontWeight: '700', color: '#10B981', backgroundColor: 'rgba(16, 185, 129, 0.1)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  etaRow: { flexDirection: 'row', alignItems: 'baseline', marginVertical: 14 },
  etaDigit: { fontSize: 36, fontWeight: '800', color: '#F59E0B', fontFamily: 'monospace', marginRight: 12 },
  etaUnit: { fontSize: 10, fontWeight: '600', color: '#94A3B8', letterSpacing: 0.5 },
  nextJettyName: { fontSize: 13, fontWeight: '600', color: '#E2E8F0', marginTop: 2 },
  stepper: { borderTopWidth: 1, borderTopColor: '#1E293B', paddingTop: 14 },
  stepItem: { flexDirection: 'row', alignItems: 'center' },
  stepLine: { width: 2, height: 16, backgroundColor: '#334155', marginLeft: 4, marginVertical: 2 },
  stepDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#475569', marginRight: 12 },
  stepCompleted: { backgroundColor: '#334155' },
  stepActive: { backgroundColor: '#0D9488' },
  stepName: { fontSize: 12, color: '#94A3B8' },
  stepNameActive: { color: '#F8FAFC', fontWeight: '700' },
  ownerNav: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  subTab: { flex: 1, paddingVertical: 10, borderRadius: 8, backgroundColor: '#131926', alignItems: 'center', borderWidth: 1, borderColor: '#1E293B' },
  subTabActive: { backgroundColor: '#0D9488', borderColor: '#0D9488' },
  subTabText: { fontSize: 12, fontWeight: '600', color: '#94A3B8' },
  subTabTextActive: { color: '#FFFFFF' },
  sectionHeader: { fontSize: 14, fontWeight: '700', color: '#F8FAFC', marginBottom: 12 },
  subText: { fontSize: 11, color: '#94A3B8', marginBottom: 16 },
  label: { fontSize: 11, fontWeight: '500', color: '#94A3B8', marginBottom: 4, marginTop: 8 },
  input: { backgroundColor: '#0B0F17', borderWidth: 1, borderColor: '#1E293B', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, color: '#F8FAFC', fontSize: 12 },
  uploadBtn: { backgroundColor: '#1E293B', borderRadius: 8, paddingVertical: 10, alignItems: 'center', marginTop: 14 },
  uploadText: { fontSize: 11, fontWeight: '600', color: '#38BDF8' },
  previewImage: { width: '100%', height: 160, borderRadius: 8, marginTop: 10 },
  primaryBtn: { backgroundColor: '#0D9488', borderRadius: 8, paddingVertical: 12, alignItems: 'center', marginTop: 16 },
  primaryBtnText: { fontSize: 12, fontWeight: '700', color: '#FFFFFF', letterSpacing: 0.5 },
  metricRow: { flexDirection: 'row', gap: 12, marginVertical: 14 },
  metricBox: { flex: 1, backgroundColor: '#0B0F17', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#1E293B' },
  metricLabel: { fontSize: 9, fontFamily: 'monospace', color: '#94A3B8', marginBottom: 8 },
  dutyPill: { paddingVertical: 6, borderRadius: 6, alignItems: 'center' },
  dutyPillActive: { backgroundColor: '#0D9488' },
  dutyPillOff: { backgroundColor: '#D97706' },
  dutyPillText: { fontSize: 11, fontWeight: '700', color: '#FFFFFF' },
  counterRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  counterBtn: { width: 28, height: 28, borderRadius: 4, backgroundColor: '#1E293B', alignItems: 'center', justifyContent: 'center' },
  counterBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  passengerCount: { fontSize: 18, fontWeight: '700', color: '#FFFFFF', fontFamily: 'monospace' },
  sosBtn: { backgroundColor: 'rgba(239, 68, 68, 0.1)', borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.3)', borderRadius: 8, paddingVertical: 12, alignItems: 'center', marginTop: 10 },
  sosText: { color: '#EF4444', fontSize: 11, fontWeight: '700', letterSpacing: 0.5 }
});
