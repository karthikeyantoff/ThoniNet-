// src/components/RealQrCameraScanner.js
// Production Hardware Camera Viewfinder with Real Barcode / QR Decoding
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Modal } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Feather } from '@expo/vector-icons';

export default function RealQrCameraScanner({ visible, onClose, onScanSuccess }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    if (visible) {
      setScanned(false);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <View style={styles.container}>
        {!permission ? (
          <View style={styles.center}>
            <Feather name="camera" size={32} color="#0D9488" style={{ marginBottom: 12 }} />
            <Text style={styles.text}>Requesting camera permission...</Text>
          </View>
        ) : !permission.granted ? (
          <View style={styles.center}>
            <Feather name="alert-triangle" size={36} color="#0F766E" style={{ marginBottom: 12 }} />
            <Text style={styles.text}>Hardware camera permission is required to scan vessel QR codes.</Text>
            <TouchableOpacity style={styles.btn} onPress={requestPermission} activeOpacity={0.85}>
              <Text style={styles.btnText}>Grant Permission</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose} activeOpacity={0.7}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <CameraView
            style={StyleSheet.absoluteFillObject}
            facing="back"
            barcodeScannerSettings={{
              barcodeTypes: ["qr"],
            }}
            onBarcodeScanned={scanned ? undefined : ({ type, data }) => {
              setScanned(true);
              onScanSuccess(data);
            }}
          >
            <View style={styles.overlay}>
              <View style={styles.header}>
                <View style={styles.headerRow}>
                  <Feather name="maximize" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                  <Text style={styles.title}>Scan Vessel QR</Text>
                </View>
                <Text style={styles.sub}>Align statutory KIV certificate code in reticle</Text>
              </View>

              {/* Real Targeting Reticle Box */}
              <View style={styles.targetReticle}>
                <View style={[styles.corner, styles.tl]} />
                <View style={[styles.corner, styles.tr]} />
                <View style={[styles.corner, styles.bl]} />
                <View style={[styles.corner, styles.br]} />
              </View>

              <TouchableOpacity style={styles.dismissBtn} onPress={onClose} activeOpacity={0.85}>
                <Feather name="x" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={styles.dismissText}>Close Camera</Text>
              </TouchableOpacity>
            </View>
          </CameraView>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  text: { color: '#0F172A', fontSize: 14, textAlign: 'center', marginBottom: 16, fontWeight: '500' },
  btn: { backgroundColor: '#0D9488', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 8 },
  btnText: { color: '#FFFFFF', fontWeight: '600', fontSize: 13 },
  cancelBtn: { marginTop: 14, padding: 8 },
  cancelText: { color: '#64748B', fontSize: 13 },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 56,
    paddingHorizontal: 24,
  },
  header: { alignItems: 'center' },
  headerRow: { flexDirection: 'row', alignItems: 'center' },
  title: { color: '#FFFFFF', fontSize: 16, fontWeight: '600', letterSpacing: -0.2 },
  sub: { color: '#E2E8F0', fontSize: 12, marginTop: 4 },
  targetReticle: {
    width: 240,
    height: 240,
    position: 'relative',
  },
  corner: { position: 'absolute', width: 28, height: 28, borderColor: '#0D9488' },
  tl: { top: 0, left: 0, borderTopWidth: 3, borderLeftWidth: 3, borderTopLeftRadius: 4 },
  tr: { top: 0, right: 0, borderTopWidth: 3, borderRightWidth: 3, borderTopRightRadius: 4 },
  bl: { bottom: 0, left: 0, borderBottomWidth: 3, borderLeftWidth: 3, borderBottomLeftRadius: 4 },
  br: { bottom: 0, right: 0, borderBottomWidth: 3, borderRightWidth: 3, borderBottomRightRadius: 4 },
  dismissBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)'
  },
  dismissText: { color: '#FFFFFF', fontWeight: '600', fontSize: 13 },
});
