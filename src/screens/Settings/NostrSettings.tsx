import {useState} from 'react'
import {View} from 'react-native'
import {Trans, useLingui} from '@lingui/react/macro'
import {type NativeStackScreenProps} from '@react-navigation/native-stack'

import {normalizeNostrPubkey} from '#/lib/nostr'
import {type CommonNavigatorParams} from '#/lib/routes/types'
import {useNostrPubkey, useSetNostrPubkey} from '#/state/preferences'
import * as SettingsList from '#/screens/Settings/components/SettingsList'
import {atoms as a, useTheme} from '#/alf'
import {Admonition} from '#/components/Admonition'
import {Button, ButtonText} from '#/components/Button'
import * as TextField from '#/components/forms/TextField'
import {Atom_Stroke2_Corner0_Rounded as AtomIcon} from '#/components/icons/Atom'
import {Key_Stroke2_Corner2_Rounded as KeyIcon} from '#/components/icons/Key'
import * as Layout from '#/components/Layout'
import * as Toast from '#/components/Toast'
import {Text} from '#/components/Typography'

type Props = NativeStackScreenProps<CommonNavigatorParams, 'NostrSettings'>

export function NostrSettingsScreen({}: Props) {
  const t = useTheme()
  const {t: l} = useLingui()

  const linkedPubkey = useNostrPubkey()
  const setLinkedPubkey = useSetNostrPubkey()

  const [draft, setDraft] = useState('')
  const trimmed = draft.trim()
  const normalized = normalizeNostrPubkey(trimmed)
  const showInvalid = trimmed.length > 0 && normalized === null
  const canSave = normalized !== null && normalized !== linkedPubkey

  function onSave() {
    if (!normalized) return
    setLinkedPubkey(normalized)
    setDraft('')
    Toast.show(l`Nostr key linked`, {type: 'success'})
  }

  function onRemove() {
    setLinkedPubkey(undefined)
    Toast.show(l`Nostr key removed`)
  }

  return (
    <Layout.Screen>
      <Layout.Header.Outer>
        <Layout.Header.BackButton />
        <Layout.Header.Content>
          <Layout.Header.TitleText>
            <Trans>Nostr</Trans>
          </Layout.Header.TitleText>
        </Layout.Header.Content>
        <Layout.Header.Slot />
      </Layout.Header.Outer>
      <Layout.Content>
        <SettingsList.Container>
          <SettingsList.Group iconInset={false}>
            <SettingsList.ItemIcon icon={AtomIcon} />
            <SettingsList.ItemText>
              <Trans>Nostr public key</Trans>
            </SettingsList.ItemText>
            <View style={[a.w_full, a.gap_md, a.pt_xs]}>
              <Text
                style={[
                  a.text_sm,
                  a.leading_snug,
                  t.atoms.text_contrast_medium,
                ]}>
                <Trans>
                  Link a Nostr public key to your account so others can find you
                  across the decentralized web. You can paste an npub or a
                  64-character hex key.
                </Trans>
              </Text>

              {linkedPubkey && (
                <View
                  style={[
                    a.w_full,
                    a.gap_xs,
                    a.p_md,
                    a.rounded_md,
                    a.border,
                    t.atoms.border_contrast_low,
                    t.atoms.bg_contrast_25,
                  ]}>
                  <Text
                    style={[
                      a.text_xs,
                      a.font_bold,
                      t.atoms.text_contrast_medium,
                    ]}>
                    <Trans>Linked key</Trans>
                  </Text>
                  <Text
                    style={[a.text_sm, t.atoms.text]}
                    selectable
                    numberOfLines={1}
                    ellipsizeMode="middle">
                    {linkedPubkey}
                  </Text>
                </View>
              )}

              <View style={[a.w_full, a.gap_sm]}>
                <TextField.Root isInvalid={showInvalid}>
                  <TextField.Icon icon={KeyIcon} />
                  <TextField.Input
                    label={l`Nostr public key`}
                    placeholder={l`npub1... or hex key`}
                    value={draft}
                    onChangeText={setDraft}
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="off"
                  />
                </TextField.Root>
                {showInvalid && (
                  <Admonition type="error">
                    <Trans>
                      That does not look like a valid Nostr public key.
                    </Trans>
                  </Admonition>
                )}
              </View>

              <Button
                label={l`Save Nostr key`}
                size="large"
                color="primary"
                disabled={!canSave}
                onPress={onSave}>
                <ButtonText>
                  <Trans>Save</Trans>
                </ButtonText>
              </Button>

              {linkedPubkey && (
                <Button
                  label={l`Remove Nostr key`}
                  size="large"
                  color="secondary"
                  onPress={onRemove}>
                  <ButtonText>
                    <Trans>Remove linked key</Trans>
                  </ButtonText>
                </Button>
              )}
            </View>
          </SettingsList.Group>
        </SettingsList.Container>
      </Layout.Content>
    </Layout.Screen>
  )
}
