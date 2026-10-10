// "What we couldn't confirm" and "Sources" accordions used under researched content.
import React from "react";
import { View, Pressable, Linking } from "react-native";
import { Accordion, Bullets, Row, Txt, Icon, tap } from "./ui";
import { useTheme } from "./theme";

export function SourceList({ sources = [], uncertain = [], mod }) {
  const t = useTheme(mod);
  return (
    <>
      {uncertain.length ? (
        <Accordion mod={mod} title="What We Couldn't Confirm" meta={<Icon name="HelpCircle" size={16} color={t.c.muted} />}>
          <Bullets items={uncertain} />
        </Accordion>
      ) : null}
      {sources.length ? (
        <Accordion mod={mod} title={`Sources (${sources.length})`} meta={<Icon name="BookOpen" size={16} color={t.c.muted} />}>
          <View style={{ gap: 8 }}>
            {sources.map(([label, url]) => (
              <Pressable key={url + label} onPress={() => { tap(); Linking.openURL(url).catch(() => {}); }} accessibilityRole="link">
                <Row gap={6} center={false}><View style={{ paddingTop: 2 }}><Icon name="ExternalLink" size={13} color={t.tint} /></View><Txt v="small" color={t.tint} style={{ flex: 1 }}>{label}</Txt></Row>
              </Pressable>
            ))}
          </View>
        </Accordion>
      ) : null}
    </>
  );
}
